import jwt from 'jsonwebtoken';
import { secret } from '../config.js';

export function generateRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateToken(payload, expiresIn) {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}
