import { Request, Response, NextFunction } from 'express';
import TokenService from '@/services/TokenService';

export function roleMiddleware(rols: string) {
  return function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const token = req.header('Authorization');

    if (!token)
      return res
        .status(401)
        .json({ error: 'Token not provided in ROLS' });

    try {
      const decoded = TokenService.validateAccessToken(
        token.split(' ')[1]
      );
      const decodedToken = decoded as { role: string };

      if (decodedToken.role === rols) {
        next();
      }
      res.status(401).json({ error: 'Invalid rols' });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
