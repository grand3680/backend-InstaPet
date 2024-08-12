import { Response, NextFunction } from 'express';
import { TCustomRequest, TUser } from '@/lib/makeRouter';
import TokenService from '@/services/TokenService';
import ErrorHandler from '@/services/ErrorHandler';

export function authMiddleware(rols: string[]) {
  return function (req: TCustomRequest, res: Response, next: NextFunction) {
    const token = req.header('Authorization');

    if (!token) {
      return next(ErrorHandler.UnauthorizedError('Token not provided in ROLS'));
    }

    try {
      const decoded = TokenService.validateAccessToken<TUser>(token.split(' ')[1]);
      const decodedToken = decoded;

      if (rols.includes(decodedToken.role) && decodedToken.userId) {
        req.user = {
          userId: decodedToken.userId,
          role: decodedToken.role
        };

        next();
      } else {
        return next(ErrorHandler.UnauthorizedError('Invalid rols'));
      }
    } catch (error: unknown) {
      return next(ErrorHandler.UnauthorizedError('Invalid token'));
    }
  };
}
