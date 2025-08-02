import jwt from 'jsonwebtoken';
import { secret } from '../config.js';
import { generateToken } from './gen.js';

export function isLoggedIn(req) {
  const token = req.cookies.auth_token;
  if (!token) {
    return false;
  }
  try {
    const payload = jwt.verify(token, secret);
    if (payload) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

export function getRole(req) {
  const token = req.cookies.auth_token;
  if (!token) {
    return 'vendeg';
  }
  try {
    const payload = jwt.verify(token, secret);
    return payload.szerep;
  } catch (err) {
    return 'vendeg';
  }
}

export function getUserInfo(req) {
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      loggedIn: false,
      role: 'vendeg',
    };
  }
  try {
    const payload = jwt.verify(token, secret);
    return {
      loggedIn: true,
      role: payload.szerep,
      felhasznalonev: payload.felhasznalonev,
    };
  } catch (err) {
    return {
      loggedIn: false,
      role: 'vendeg',
    };
  }
}

export function loginUser(res, felhasznalonev, szerep, expiresIn = 180) {
  const token = generateToken({ felhasznalonev, szerep }, expiresIn);
  res.cookie('auth_token', token, { httpOnly: true });
}
