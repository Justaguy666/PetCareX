import authService from "./auth.service.js";
import { BadRequestError, UnauthorizedError } from "../../errors/app.error.js";

class AuthController {
    register = async (req, res) => {
        const { email, username, password } = req.body;

        if(!email || !username || !password) {
            throw new BadRequestError("Email, username and password are required");
        }

        const result = await authService.register(email, username, password);

        return res.status(200).json({ data: result });
    }

    login = async (req, res) => {
        const { email, username, password } = req.body;

        if((!email && !username) || !password) {
            throw new BadRequestError("Email, username and password are required");
        }

        const { accessToken, refreshToken } = await authService.login(email, username, password);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60 * 1000,
        });
    
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successfully"
        });
    }

    logout = async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
        if(refreshToken) {
            await authService.logout(refreshToken);
            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                path: "/",
            });
        }

        const accessToken = req.cookies?.accessToken;
        if (accessToken) {
            res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logout successfully",
        });
    }

    refresh = async (req, res) => {
        const oldRefreshToken = req.cookies?.refreshToken;
        if (!oldRefreshToken) {
            throw new UnauthorizedError("Missing credentials");
        }

        const { newAccessToken: accessToken, newRefreshToken: refreshToken } = await authService.refresh(oldRefreshToken);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60 * 1000,
        });
    
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "New refresh token added",
        });
    }

    me = async (req, res) => {
        const account = req.account;
        if(!account) {
            throw new UnauthorizedError("Missing credentials");
        }

        const user = await authService.me(account);

        return res.status(200).json({ data: user });
    }
}

export default new AuthController();