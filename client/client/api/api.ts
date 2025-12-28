const DEFAULT_API_BASE = 'http://localhost:3001/api';

function getApiBase() {
    // Vite env var (set VITE_API_BASE) can override base URL in different environments
    // import.meta.env is available at runtime in Vite-built code
    // @ts-ignore
    const envBase = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_BASE as string | undefined) : undefined;
    return envBase || DEFAULT_API_BASE;
}

function buildUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    const base = getApiBase().replace(/\/+$/, '');
    // avoid double /api if caller passed a path starting with /api
    if (path.startsWith('/api')) path = path.slice(4);
    if (!path.startsWith('/')) path = '/' + path;
    return base + path;
}

async function request(method: string, path: string, body?: any, options: RequestInit = {}) {
    const url = buildUrl(path);
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
        method,
        credentials: 'include', // include cookies by default to support cookie-based auth
        headers,
        body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
        ...options,
    });

    // Try to parse JSON when possible
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
        let text = '';
        try {
            if (contentType.includes('application/json')) {
                const j = await res.json();
                text = j?.message || JSON.stringify(j);
            } else {
                text = await res.text();
            }
        } catch (e) {
            text = res.statusText;
        }
        const err: any = new Error(text || `HTTP ${res.status}`);
        err.status = res.status;
        err.response = res;
        throw err;
    }

    if (contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}

export const apiGet = (path: string, options?: RequestInit) => request('GET', path, undefined, options);
export const apiPost = (path: string, body?: any, options?: RequestInit) => request('POST', path, body, options);
export const apiPut = (path: string, body?: any, options?: RequestInit) => request('PUT', path, body, options);
export const apiDelete = (path: string, body?: any, options?: RequestInit) => request('DELETE', path, body, options);

export default {
    request,
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,
};
