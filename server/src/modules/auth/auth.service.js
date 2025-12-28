import authRepo from "./auth.repo.js";
import { ConflictError, UnauthorizedError, ForbiddenError } from "../../errors/app.error.js";
import bcrypt from "bcrypt";
import { signToken, generateToken, verifyToken } from "../../utils/jwt.util.js";

class AuthService {
    register = async (email, username, password) => {
        if(await authRepo.isExistingEmail(email)) {
            throw new ConflictError("Email already exists");
        }

        if(await authRepo.isExistingUsername(username)) {
            throw new ConflictError("Username already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const userId = await authRepo.createUser(email);
        const result = await authRepo.createAccount(userId, username, hashed);

        return result;
    }

    login = async (email, username, password) => {
        const account = email
            ? await authRepo.findAccountByEmail(email)
            : await authRepo.findAccountByUsername(username);

        if (!account) {
            throw new UnauthorizedError("Email, username or password incorrect");
        }

        if (!account.is_active) {
            throw new ForbiddenError("Account is not activated");
        }

        const isMatch = await bcrypt.compare(password, account.hashed_password);
        if (!isMatch) {
            throw new UnauthorizedError("Email, username or password incorrect");
        }

        await authRepo.updateLastLogin(account.id);
        const refreshToken = generateToken();
        const accessToken = signToken({
            id: account.id,
            user_id: account.user_id,
            role: account.account_type
        }, '15m');

        Promise.all([
            authRepo.deleteRefreshTokenById(account.id),
            authRepo.saveRefreshToken(account.id, refreshToken)
        ])

        return {
            accessToken,
            refreshToken
        }
    }

    logout = async (refreshToken) => {
        await authRepo.deleteRefreshTokenByToken(refreshToken);
    }

    refresh = async (refreshToken) => {
        const storedToken = await authRepo.findRefreshToken(refreshToken);

        if(!storedToken) {
            throw new UnauthorizedError("Refresh token invalid");
        }

        if (storedToken.expires_at < new Date()) {
            throw new UnauthorizedError("Refresh token revoked");
        }

        const account = await authRepo.findAccountById(storedToken.account_id);

        const newRefreshToken = generateToken();
        const newAccessToken = signToken({
            id: account.id,
            user_id: account.user_id,
            role: account.account_type
        }, '15m');

        Promise.all([
            authRepo.deleteRefreshTokenById(account.id),
            authRepo.saveRefreshToken(account.id, newRefreshToken)
        ])

        return {
            newAccessToken,
            newRefreshToken
        }
    }

    me = async (account) => {
        const accountId = account.id;
        // Try to find user first, if not found try employee
        let result = await authRepo.findUserById(accountId);
        if (!result) {
            result = await authRepo.findEmployeeById(accountId);
        }
        return result;
    }
}

export default new AuthService();