import express from 'express';
import path from 'path';

import * as sportpalyakTable from '../db/sportpalyak.js';
import * as felhasznalokTable from '../db/felhasznalok.js';
import * as foglalasokTable from '../db/foglalasok.js';

import { authorize } from '../middleware/authorization.js';
import { isLoggedIn, getUserInfo } from '../utility/authorization.js';
import { formatFoglalasok } from '../utility/formatting.js';
import { compileTemplate } from '../utility/templates.js';
import * as cfg from '../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;

  try {
    const palyak = await sportpalyakTable.findAllPalyakWithImages();
    const userInfo = getUserInfo(req);
    res.render('fooldal', { palyak, statusMessage, userInfo });
    return;
  } catch (err) {
    res.status(500).render('error', { message: `Hiba a lekérdezés során: ${err.message}` });
  }
});

router.get('/sportpalya-hozzaadas', authorize(['admin']), (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;
  const userInfo = getUserInfo(req);
  res.render('sportpalya-hozzaadas', { statusMessage, userInfo });
});

// azon diakok eseten, akik regisztracioja elutasitodik, az elso bejelentkezesi probalkozasnal az oldal tudatja veluk, hogy el lettek utasitva,
//  ezt kovetoen pedig a felhasznalojuk automatikusan torlodik az adatbazisbol
router.get('/diakok', authorize(['admin']), async (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;
  const userInfo = getUserInfo(req);
  try {
    const diakok = await felhasznalokTable.findAllDiakok();
    const diakokPending = [];
    const diakokRegistered = [];
    for (let i = 0; i < diakok.length; i++) {
      if (diakok[i].Fiokallapot === 'fuggoben') {
        diakokPending.push(diakok[i]);
      } else if (diakok[i].Fiokallapot === 'ok' || diakok[i].Fiokallapot === 'kitiltva') {
        diakokRegistered.push(diakok[i]);
      }
    }
    res.render('diakok', { statusMessage, userInfo, diakokPending, diakokRegistered });
  } catch (err) {
    res.status(500).render('error', { message: 'Szerver hiba', userInfo });
  }
});

// az diakokat megjelenito oldal csak egy reszet jeleniti meg
// ajax fetch keresre hasznaljuk
router.get('/diakok-registered-table', authorize(['admin']), async (req, res) => {
  const userInfo = getUserInfo(req);
  try {
    const diakokRegistered = await felhasznalokTable.findRegisteredDiakok();
    const html = compileTemplate(path.join(cfg.partialsDir, 'diakok-registered-table.hbs'), { diakokRegistered });
    res.send(html);
  } catch (err) {
    res.status(500).render('error', { message: 'Szerver hiba', userInfo });
  }
});

router.get('/foglalasaim', authorize(['diak', 'admin']), async (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;
  const userInfo = getUserInfo(req);
  try {
    let foglalasok = await foglalasokTable.findByFelhasznalonev(userInfo.felhasznalonev);
    foglalasok = formatFoglalasok(foglalasok);
    res.render('foglalasaim', { statusMessage, userInfo, foglalasok });
  } catch (err) {
    res.status(500).render('error', { message: 'Szerver hiba', userInfo });
  }
});

router.get('/osszes-foglalas', authorize(['admin']), async (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;
  const userInfo = getUserInfo(req);
  try {
    let foglalasok = await foglalasokTable.findAll();
    foglalasok = formatFoglalasok(foglalasok);
    res.render('osszes-foglalas', { statusMessage, userInfo, foglalasok });
  } catch (err) {
    res.status(500).render('error', { message: 'Szerver hiba', userInfo });
  }
});

router.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/');
    return;
  }
  const statusMessage = req.session.message;
  req.session.message = null;
  res.render('login-page', { statusMessage });
});

router.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/');
    return;
  }
  const statusMessage = req.session.message;
  req.session.message = null;
  res.render('registration-page', { statusMessage });
});

router.get('/logout', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    res.redirect('/');
    return;
  }
  cfg.tokenBlacklist.add(token);
  res.clearCookie('auth_token');
  req.session.message = 'Sikeres kijelentkezés';
  res.redirect('/');
});

export default router;
