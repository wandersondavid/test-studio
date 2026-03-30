import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET ?? 'test-studio-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';
const RUNNER_SHARED_SECRET = process.env.RUNNER_SHARED_SECRET ?? 'test-studio-runner-secret';
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}
export function signAuthToken(user) {
    const signOptions = {
        expiresIn: JWT_EXPIRES_IN,
    };
    return jwt.sign({
        userId: user._id,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, signOptions);
}
export function verifyAuthToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export function getRunnerSharedSecret() {
    return RUNNER_SHARED_SECRET;
}
export function extractBearerToken(headerValue) {
    if (!headerValue)
        return null;
    const [scheme, token] = headerValue.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token)
        return null;
    return token;
}
//# sourceMappingURL=auth.js.map