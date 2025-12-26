const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
};

export function setAccessTokenCookie(res, token) {
    res.cookie('accessToken', token, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });
}

export function setRefreshTokenCookie(res, token) {
    res.cookie('refreshToken', token, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export function clearAuthCookies(res) {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
}

export function getAccessToken(req) {
    return req.cookies?.accessToken;
}

export function getRefreshToken(req) {
    return req.cookies?.refreshToken;
}
