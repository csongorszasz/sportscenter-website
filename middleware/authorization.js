import jwt from 'jsonwebtoken';
import { secret, tokenBlacklist } from '../config.js';
import { getUserInfo } from '../utility/authorization.js';

export function authorize(requiredRoles = []) {
  return (req, res, next) => {
    if (requiredRoles.includes('vendeg')) {
      next();
      return;
    }

    const token = req.cookies.auth_token;
    if (!token) {
      req.session.message = 'Bejelentkezés szükséges';
      res.status(401).redirect('/login');
      return;
    }

    if (tokenBlacklist.has(token)) {
      req.session.message = 'Bejelentkezés szükséges';
      res.status(401).redirect('/login');
      return;
    }

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        console.log(`401 JWT verification failed: ${err.name}: ${err.message}`);
        req.session.message = 'Bejelentkezés szükséges';
        res.status(401).redirect('/login');
        return;
      }
      req.felhasznalonev = payload.felhasznalonev;
      if (!requiredRoles.includes(payload.szerep)) {
        res.status(403).render('error', { message: '403 Forbidden', userInfo: getUserInfo(req) });
        return;
      }

      next();
    });
  };
}
