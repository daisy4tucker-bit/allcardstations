import jwt from 'jsonwebtoken';
import { JWTPayload } from '../models/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'allcardstatus_super_secret_jwt_key_phase2_dev';
const LEGACY_SECRETS = ['allcardvault_super_secret_jwt_key_phase2_dev', 'allcardstation_super_secret_jwt_key_phase2_dev'];
const JWT_EXPIRES_IN = '7d';

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    for (const legacy of LEGACY_SECRETS) {
      if (JWT_SECRET !== legacy) {
        try {
          return jwt.verify(token, legacy) as JWTPayload;
        } catch {
          // continue
        }
      }
    }
    throw err;
  }
}
