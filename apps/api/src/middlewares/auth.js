import { UserService } from '../services/user.service.js';
import { buildAuditActor } from '../utils/audit.js';
import { extractBearerToken, getRunnerSharedSecret, verifyAuthToken } from '../utils/auth.js';
const userService = new UserService();
export async function attachAuthenticatedUser(req, _res, next) {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        next();
        return;
    }
    try {
        const claims = verifyAuthToken(token);
        const user = await userService.findById(claims.userId);
        if (!user || user.status !== 'active') {
            next();
            return;
        }
        req.auth = {
            user,
            actor: buildAuditActor({ _id: user.id, name: user.name, email: user.email, role: user.role }),
        };
    }
    catch {
        // ignora token inválido e deixa o requireAuth responder depois
    }
    next();
}
export function requireAuth(req, res, next) {
    if (!req.auth?.user) {
        res.status(401).json({ error: 'Faça login para continuar.' });
        return;
    }
    next();
}
export function requireAdmin(req, res, next) {
    if (!req.auth?.user) {
        res.status(401).json({ error: 'Faça login para continuar.' });
        return;
    }
    if (req.auth.user.role !== 'admin') {
        res.status(403).json({ error: 'Apenas administradores podem executar essa ação.' });
        return;
    }
    next();
}
export function requireRunnerSecret(req, res, next) {
    if (req.headers['x-runner-secret'] !== getRunnerSharedSecret()) {
        res.status(401).json({ error: 'Acesso interno do runner não autorizado.' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map