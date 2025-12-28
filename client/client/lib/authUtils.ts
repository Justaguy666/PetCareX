import { User } from "@shared/types";

/**
 * Check if user is authenticated and redirect to login if not
 * @param user - Current user object from useAuth
 * @param redirectUrl - URL to redirect back to after login
 * @returns true if authenticated, false if redirected to login
 */
export function requireLogin(user: User | null, redirectUrl?: string): boolean {
    if (!user) {
        // Store the intended destination
        const destination = redirectUrl || window.location.pathname + window.location.search;

        // Redirect to login with return URL
        window.location.href = `/login?redirect=${encodeURIComponent(destination)}`;
        return false;
    }
    return true;
}

/**
 * Get the redirect URL from query parameters after login
 * @returns The redirect URL or null if not present
 */
export function getRedirectUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
}
