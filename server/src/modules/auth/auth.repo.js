import db from "../../config/db.js";

class AuthRepo {
    isExistingEmail = async (email) => {
        const query =  `SELECT 1
                        FROM users
                        WHERE email = $1
                        LIMIT 1`;
    
        const { rowCount } = await db.query(query, [email]);
        return rowCount > 0;
    };

    isExistingUsername = async (username) => {
        const query =  `SELECT 1
                        FROM users
                        WHERE email = $1
                        LIMIT 1`;

        const { rowCount } = await db.query(query, [username]);
        return rowCount > 0;
    }

    createUser = async (email) => {
        const query = `INSERT INTO users (email)
                       VALUES ($1)
                       RETURNING id`;
        const result = await db.query(query, [email]);
        return result.rows[0].id;
    }

    createAccount = async (user_id, username, password) => {
        const query = `INSERT INTO accounts (user_id, username, hashed_password, is_active)
                       VALUES ($1, $2, $3, true)
                       RETURNING *`;
        const result = await db.query(query, [user_id, username, password]);
        return result.rows[0];
    }

    findAccountByEmail = async (email) => {
        const query =  `SELECT a.id, a.user_id, a.username, a.hashed_password, a.is_active, a.account_type
                        FROM users u
                        JOIN accounts a on a.user_id = u.id
                        WHERE u.email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    findAccountByUsername = async (username) => {
        const query =  `SELECT id, user_id, username, hashed_password, is_active, account_type
                        FROM accounts
                        WHERE username = $1`;
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    updateLastLogin = async (account_id) => {
        const query =  `UPDATE accounts
                        SET last_login_at = NOW()
                        WHERE id = $1`;
        await db.query(query, [account_id]);
    }

    saveRefreshToken = async (account_id, token) => {
        const query =  `INSERT INTO refresh_tokens (account_id, token, expires_at)
                        VALUES ($1, $2, $3)`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db.query(query, [account_id, token, expiresAt]);
    }

    deleteRefreshTokenById = async (account_id) => {
        const query =  `DELETE FROM refresh_tokens 
                        WHERE account_id = $1`;
        await db.query(query, [account_id]);
    }

    deleteRefreshTokenByToken = async (token) => {
        const query =  `DELETE FROM refresh_tokens 
                        WHERE token = $1`;
        await db.query(query, [token]);
    }

    findRefreshToken = async (account_id, token) => {
        const query =  `SELECT
                        FROM refresh_tokens
                        WHERE account_id = $1
                        AND token = $2`
        const result = await db.query(query, [account_id, token]);
        return result.rows[0];
    }
}

export default new AuthRepo();