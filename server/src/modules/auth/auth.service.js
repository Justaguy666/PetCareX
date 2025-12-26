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
            id: account.user_id,
            role: account.account_type
        }, '15m');
        console.log(account);

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
        const decoded = verifyToken(refreshToken, process.env.JWT_SECRET);

        const storedToken = await authRepo.findRefreshToken(refreshToken, decoded.account_id);

        if(!storedToken) {
            throw new UnauthorizedError("Refresh token invalid");
        }

        if (storedToken.expiredAt < new Date()) {
            throw new UnauthorizedError("Refresh token revoked");
        }

        const newRefreshToken = generateToken();
        const newAccessToken = signToken({
            id: account.user_id,
            role: account.role
        }, '15m');

        Promise.all([
            authRepo.deleteRefreshTokenById(decoded.account_id),
            authRepo.saveRefreshToken(decoded.account_id, newRefreshToken)
        ])

        return {
            newAccessToken,
            newRefreshToken
        }
    }
}

export default new AuthService();