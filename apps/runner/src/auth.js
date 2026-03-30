import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET ?? 'test-studio-dev-secret';
const RUNNER_SHARED_SECRET = process.env.RUNNER_SHARED_SECRET ?? 'test-studio-runner-secret';
function extractBearerToken(headerValue) {
    if (!headerValue)
        return null;
    const [scheme, token] = headerValue.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token)
        return null;
    return token;
}
export function requireRunnerSecret(req, res, next) {
    if (req.headers['x-runner-secret'] !== RUNNER_SHARED_SECRET) {
        res.status(401).json({ error: 'Acesso interno do runner não autorizado.' });
        return;
    }
    next();
}
export function requireRecorderAuth(req, res, next) {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        res.status(401).json({ error: 'Faça login para usar o recorder.' });
        return;
    }
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: 'Token inválido para o recorder.' });
    }
}
//# sourceMappingURL=auth.js.map