import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function autenticarJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo_super_secreto');
    // @ts-ignore
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
