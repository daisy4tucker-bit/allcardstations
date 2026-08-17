import jwt from 'jsonwebtoken';
import { JWTPayload } from '../models/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'allcardstation_super_secret_jwt_key_phase2_dev';
const JWT_EXPIRES_IN = '7d';

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
