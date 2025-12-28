import db from "../../config/db.js";
import * as Q from "./auth.query.js";

class AuthRepo {
    isExistingEmail = async (email) => {
        const { rowCount } = await db.query(Q.CHECK_EMAIL_EXISTS, [email]);
        return rowCount > 0;
    };

    isExistingUsername = async (username) => {
        const { rowCount } = await db.query(Q.CHECK_USERNAME_EXISTS, [username]);
        return rowCount > 0;
    }

    createUser = async (email) => {
        const result = await db.query(Q.CREATE_USER, [email]);
        return result.rows[0].id;
    }

    createAccount = async (user_id, username, password) => {
        const result = await db.query(Q.CREATE_ACCOUNT, [user_id, username, password]);
        return result.rows[0];
    }

    findAccountByEmail = async (email) => {
        const result = await db.query(Q.FIND_ACCOUNT_BY_EMAIL, [email]);
        return result.rows[0];
    }

    findAccountByUsername = async (username) => {
        const result = await db.query(Q.FIND_ACCOUNT_BY_USERNAME, [username]);
        return result.rows[0];
    }

    findAccountById = async (account_id) => {
        const result = await db.query(Q.FIND_ACCOUNT_BY_ID, [account_id]);
        return result.rows[0];
    }

    updateLastLogin = async (account_id) => {
        await db.query(Q.UPDATE_LAST_LOGIN, [account_id]);
    }

    saveRefreshToken = async (account_id, token) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db.query(Q.SAVE_REFRESH_TOKEN, [account_id, token, expiresAt]);
    }

    deleteRefreshTokenById = async (account_id) => {
        await db.query(Q.DELETE_REFRESH_TOKEN_BY_ID, [account_id]);
    }

    deleteRefreshTokenByToken = async (token) => {
        await db.query(Q.DELETE_REFRESH_TOKEN_BY_TOKEN, [token]);
    }

    findRefreshToken = async (token) => {
        const result = await db.query(Q.FIND_REFRESH_TOKEN, [token]);
        return result.rows[0];
    }

    findUserById = async (account_id) => {
        const result = await db.query(Q.FIND_USER_BY_ACCOUNT_ID, [account_id]);
        return result.rows[0];
    }

    findEmployeeById = async (account_id) => {
        const result = await db.query(Q.FIND_EMPLOYEE_BY_ACCOUNT_ID, [account_id]);
        return result.rows[0];
    }
}

export default new AuthRepo();