import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { clearStoredSession, getStoredSession, setStoredSession } from '@/services/session';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(() => getStoredSession());
    const [needsSetup, setNeedsSetup] = useState(false);
    const [loading, setLoading] = useState(true);
    async function refreshSession() {
        const stored = getStoredSession();
        if (!stored) {
            const bootstrap = await api.get('/auth/bootstrap-state');
            setNeedsSetup(bootstrap.data.needsSetup);
            setSession(null);
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('/auth/me');
            const nextSession = {
                ...stored,
                user: response.data.user,
            };
            setStoredSession(nextSession);
            setNeedsSetup(false);
            setSession(nextSession);
        }
        catch {
            clearStoredSession();
            setSession(null);
            const bootstrap = await api.get('/auth/bootstrap-state');
            setNeedsSetup(bootstrap.data.needsSetup);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        void refreshSession();
    }, []);
    async function login(input) {
        const response = await api.post('/auth/login', input);
        setStoredSession(response.data);
        setSession(response.data);
        setNeedsSetup(false);
    }
    async function bootstrapAdmin(input) {
        const response = await api.post('/auth/register', input);
        setStoredSession(response.data);
        setSession(response.data);
        setNeedsSetup(false);
    }
    function logout() {
        clearStoredSession();
        setSession(null);
    }
    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        loading,
        needsSetup,
        login,
        bootstrapAdmin,
        logout,
        refreshSession,
    }), [loading, needsSetup, session]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
    }
    return value;
}
//# sourceMappingURL=AuthProvider.js.map