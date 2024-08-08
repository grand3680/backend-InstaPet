import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header('Authorization');

  if (!token)
    return res.status(401).json({ error: 'Access denied!!' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!);
    console.log(decoded);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
