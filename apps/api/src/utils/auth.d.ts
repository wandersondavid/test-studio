import type { User } from '@test-studio/shared-types';
export interface AuthTokenClaims {
    userId: string;
    email: string;
    role: 'admin' | 'member';
}
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, passwordHash: string): Promise<boolean>;
export declare function signAuthToken(user: Pick<User, '_id' | 'email' | 'role'>): string;
export declare function verifyAuthToken(token: string): AuthTokenClaims;
export declare function getRunnerSharedSecret(): string;
export declare function extractBearerToken(headerValue?: string): string | null;
//# sourceMappingURL=auth.d.ts.map