import type { NextFunction, Request, Response } from 'express';
export declare function attachAuthenticatedUser(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
export declare function requireRunnerSecret(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map