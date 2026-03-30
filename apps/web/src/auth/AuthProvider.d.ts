import { type ReactNode } from 'react';
import type { AuthSession, LoginInput, RegisterUserInput, User } from '@test-studio/shared-types';
interface AuthContextValue {
    session: AuthSession | null;
    user: User | null;
    loading: boolean;
    needsSetup: boolean;
    login: (input: LoginInput) => Promise<void>;
    bootstrapAdmin: (input: RegisterUserInput) => Promise<void>;
    logout: () => void;
    refreshSession: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): any;
export declare function useAuth(): AuthContextValue;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map