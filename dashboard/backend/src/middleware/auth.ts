import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  org_id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers['x-user-role'] as string;
  const userIdHeader = req.headers['x-user-id'] as string;
  const orgIdHeader = req.headers['x-org-id'] as string;

  // Default simulated or token-derived user
  req.user = {
    id: userIdHeader || 'usr-101-janson',
    email: 'williams@mesh.com',
    role: roleHeader === 'ADMIN' ? 'ADMIN' : 'USER',
    org_id: orgIdHeader || 'org-mesh-security'
  };

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required. Standard USER role cannot access administration endpoints.'
    });
  }
  next();
};
