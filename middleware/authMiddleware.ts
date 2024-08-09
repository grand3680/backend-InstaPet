import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header('Authorization');

  if (!token)
    return res.status(401).json({ error: 'Token not provided' });

  try {
    jwt.verify(token.split(' ')[1], process.env.SECRET_ACCSEES!);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
