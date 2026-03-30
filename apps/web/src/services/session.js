const STORAGE_KEY = 'test-studio.session';
export function getStoredSession() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}
export function setStoredSession(session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
export function clearStoredSession() {
    window.localStorage.removeItem(STORAGE_KEY);
}
export function getAuthToken() {
    return getStoredSession()?.token ?? null;
}
//# sourceMappingURL=session.js.map