import { ZodError } from 'zod';
export function errorHandler(err, req, res, next) {
    if (err instanceof ZodError) {
        res.status(400).json({ error: 'Dados inválidos', details: err.errors });
        return;
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
}
//# sourceMappingURL=errorHandler.js.map