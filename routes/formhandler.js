import express from 'express';
import multer from 'multer';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

import * as vd from '../utility/validator.js';
import { generateRandomInteger } from '../utility/gen.js';
import { authorize } from '../middleware/authorization.js';
import { getUserInfo, isLoggedIn, loginUser } from '../utility/authorization.js';

import * as sportpalyakTable from '../db/sportpalyak.js';
import * as kepekTable from '../db/kepek.js';
import * as felhasznalokTable from '../db/felhasznalok.js';
import * as foglalasokTable from '../db/foglalasok.js';

// feltöltési mappa elkészítése
const uploadDir = path.join(process.cwd(), 'uploadDir');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

// multer middleware előkészítése
const maxFileSize = 2 * 1024 * 1024; // 2 MB-s méret limit
const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: maxFileSize,
  },
}).single('kep');

const router = express.Router();

// a feltoltott allomanyokat konnyen elerhetove tesszuk
router.use(express.static(path.join(process.cwd(), 'uploadDir')));

function redirectWithMsg(req, res, url, msg) {
  req.session.message = msg;
  res.redirect(url);
}

function validateSportpalyaHozzaadas(req) {
  const { palyaTipus, oraber, cim, leiras, nyitas, zaras } = req.body;

  vd.validateDefined(palyaTipus, oraber, cim, leiras, nyitas, zaras);
  vd.validateFloat(oraber);
  vd.validateStringNotLongerThan(palyaTipus, 20);
  vd.validateStringNotLongerThan(cim, 50);
  vd.validateStringNotLongerThan(leiras, 100);
  vd.validateNonNegative(oraber);
  vd.validateTime(nyitas);
  vd.validateTime(zaras);
  if (nyitas >= zaras) {
    throw new Error('a nyitási idő nem lehet később, mint a záró idő');
  }
  if (nyitas.split(':')[1] !== '00' || zaras.split(':')[1] !== '00') {
    throw new Error('a nyitási és záró időpontoknak egész órára kell lenniük beállítva');
  }

  return [palyaTipus, oraber, cim, leiras, nyitas, zaras];
}

router.post('/sportpalya-hozzaadas', authorize(['admin']), express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const [palyaTipus, oraber, cim, leiras, nyitas, zaras] = validateSportpalyaHozzaadas(req);
    await sportpalyakTable.insert(palyaTipus, oraber, cim, leiras, nyitas, zaras);
  } catch (err) {
    console.error(`Sportpálya hozzáadása sikertelen: ${err.message}`);
    redirectWithMsg(req, res, '/sportpalya-hozzaadas', `Sportpálya hozzáadása sikertelen: ${err.message}`); // redirect a palya hozzaadas oldalra
    return;
  }
  redirectWithMsg(req, res, '/', 'Sportpálya sikeresen hozzáadva'); // redirect a fooldalra
});

router.post('/kepfeltoltes', authorize(['admin']), (req, res) => {
  multerUpload(req, res, async (uploadErr) => {
    const returnUrl = req.get('referer');

    if (uploadErr) {
      redirectWithMsg(
        req,
        res,
        returnUrl,
        `Kép feltöltése sikertelen: ${uploadErr.message}. Max file size: ${maxFileSize / (1024 * 1024)}MB`,
      );
      return;
    }

    const fileHandler = req.file;
    if (fileHandler === undefined || fileHandler.size === 0) {
      unlinkSync(fileHandler.path);
      redirectWithMsg(req, res, returnUrl, 'Kép feltöltése sikertelen: hibás vagy nem létező kép');
      return;
    }
    if (!fileHandler.mimetype.startsWith('image/')) {
      unlinkSync(fileHandler.path);
      redirectWithMsg(req, res, returnUrl, 'Kép feltöltése sikertelen: a megadott fájl nem egy kép');
      return;
    }
    const privateFile = Boolean(req.body.private);

    const palyaId = parseInt(req.body.palyaId, 10);
    if (Number.isNaN(palyaId)) {
      unlinkSync(fileHandler.path);
      redirectWithMsg(req, res, returnUrl, 'Kép feltöltése sikertelen: helytelen ID');
      return;
    }

    try {
      if (!(await sportpalyakTable.existsPalya(palyaId))) {
        unlinkSync(fileHandler.path);
        redirectWithMsg(req, res, returnUrl, `Nem létezik sportpálya a megadott ID-val (id=${palyaId})`);
        return;
      }
      await kepekTable.insert(palyaId, fileHandler.path);
    } catch (err) {
      unlinkSync(fileHandler.path);
      redirectWithMsg(req, res, returnUrl, `Kép feltöltése sikertelen: ${err.message}`);
      return;
    }

    const message = `Received an upload:
      filename: ${fileHandler.originalname}
      name on server: ${fileHandler.path}
      size: ${fileHandler.size}
      mime-type: ${fileHandler.mimetype}
      private (body): ${privateFile}
    `;
    console.log(message);

    console.log('Kép sikeresen feltöltve');
    redirectWithMsg(req, res, returnUrl, 'Kép sikeresen feltöltve');
  });
});

router.get('/palyakereses', async (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;
  const returnUrl = '/';

  const { palyaTipus } = req.query;

  let { minOraber, maxOraber } = req.query;
  if (minOraber === undefined || minOraber === '') {
    minOraber = 0;
  } else {
    minOraber = parseFloat(minOraber);
  }
  if (maxOraber === undefined || maxOraber === '') {
    maxOraber = 100000000;
  } else {
    maxOraber = parseFloat(maxOraber);
  }

  if (palyaTipus === undefined || Number.isNaN(minOraber) || Number.isNaN(maxOraber)) {
    redirectWithMsg(req, res, returnUrl, 'Helytelen paraméterek');
    return;
  }
  if (minOraber > maxOraber) {
    redirectWithMsg(req, res, returnUrl, 'A minimum órabér nem lehet nagyobb a maximumnál');
    return;
  }

  try {
    const palyak = await sportpalyakTable.findPalyakWithImages(palyaTipus, minOraber, maxOraber);
    res.render('fooldal', { palyak, statusMessage, userInfo: getUserInfo(req) });
  } catch (err) {
    redirectWithMsg(req, res, returnUrl, `Hiba a lekérdezés során: ${err.message}`);
  }
});

// komolyabb hibak eseten egy hiba oldalra iranyitjuk a felhasznalot
// mas esetben a felhasznalot visszairanyitjuk a palya oldalra es beallitunk egy uzenetet a session-ben
router.get('/foglalas-keszites', authorize(['diak', 'admin']), async (req, res) => {
  const palyaId = parseInt(req.query.palyaId, 10);
  const { felhasznalonev } = req.query;
  const ora = parseInt(req.query.ora, 10);
  const date = new Date(req.query.date);
  const idotartam = parseInt(req.query.idotartam, 10);

  vd.validateDefined(palyaId, felhasznalonev, ora, date, idotartam);

  const returnUrl = `/palyak/${palyaId}`;

  try {
    if (!(await sportpalyakTable.existsPalya(palyaId))) {
      redirectWithMsg(req, res, returnUrl, `Nem létezik sportpálya a megadott ID-val (id=${palyaId})`);
      return;
    }
    if (!(await felhasznalokTable.existsFelhasznalonev(felhasznalonev))) {
      redirectWithMsg(req, res, returnUrl, `Nem létezik ilyen felhasználónév (felhasználónév=${felhasznalonev})`);
      return;
    }
  } catch (err) {
    res.status(500).render('error', { message: `Hiba a lekérdezés során: ${err.message}` });
    return;
  }

  const idopont = new Date(date.setHours(ora, 0, 0, 0));
  if (idopont < new Date()) {
    redirectWithMsg(req, res, returnUrl, 'Hibás időpont: a megadott időpont már elmúlt');
    return;
  }

  if (idopont.getMinutes() !== 0) {
    redirectWithMsg(
      req,
      res,
      returnUrl,
      `Hibás időpont [${idopont}]: az időpont egész órára kell legyen beállítva (pl. 13:00)`,
    );
    return;
  }

  if (idotartam <= 0) {
    redirectWithMsg(req, res, returnUrl, 'Hibás időtartam: a megadott időtartam nem pozitív');
    return;
  }

  if (idotartam + ora > 24) {
    redirectWithMsg(req, res, returnUrl, 'Hibás időtartam: a megadott időtartammal a foglalás másnapra esne');
    return;
  }

  const closingHour = (await sportpalyakTable.getOpeningAndClosingHours(palyaId))[1];
  if (idotartam + ora > closingHour) {
    redirectWithMsg(
      req,
      res,
      returnUrl,
      'Hibás időtartam: a megadott időtartammal a foglalás a pálya zárási ideje után esne',
    );
    return;
  }

  try {
    await foglalasokTable.insert(felhasznalonev, palyaId, idopont, idotartam);
  } catch (err) {
    res.status(400).render('error', { message: `Foglalás létrehozása sikertelen: ${err.message}` });
    return;
  }

  console.log('Foglalás sikeresen létrehozva');
  redirectWithMsg(req, res, returnUrl, 'Foglalás sikeresen létrehozva');
});

router.post('/register', express.urlencoded({ extended: true }), async (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/');
    return;
  }

  const { felhasznalonev, jelszo, 'jelszo-again': jelszoAgain } = req.body;
  try {
    vd.validateDefined(felhasznalonev, jelszo, jelszoAgain);
    vd.validateStringNotLongerThan(felhasznalonev, 50);
    vd.validateStringNotLongerThan(jelszo, 100);
    vd.validateStringNotLongerThan(jelszoAgain, 100);
    vd.validatePasswordsMatch(jelszo, jelszoAgain);
    if (await felhasznalokTable.existsFelhasznalonev(felhasznalonev)) {
      throw new Error('felhasználónév foglalt');
    }
    const hashedJelszo = await bcrypt.hash(jelszo, generateRandomInteger(10, 14));
    await felhasznalokTable.insert(felhasznalonev, hashedJelszo, 'diak', 'fuggoben'); // a felhasznalo regisztracioja jovahagyasra var
  } catch (err) {
    redirectWithMsg(req, res, '/register', `Hiba: ${err.message}`);
    return;
  }
  redirectWithMsg(
    req,
    res,
    '/',
    'Sikeres regisztráció. Fiókja használhatóvá válik, amint azt egy adminisztrátor jóváhagyja.',
  );
});

router.post('/login', express.urlencoded({ extended: true }), async (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/');
    return;
  }

  const { felhasznalonev, jelszo } = req.body;
  try {
    vd.validateDefined(felhasznalonev, jelszo);
    vd.validateStringNotLongerThan(felhasznalonev, 50);
    vd.validateStringNotLongerThan(jelszo, 100);
    const felhasznalo = await felhasznalokTable.findByFelhasznalonev(felhasznalonev);
    if (!felhasznalo) {
      throw new Error('helytelen felhasználónév vagy jelszó');
    }
    const match = await bcrypt.compare(jelszo, felhasznalo.Jelszo);
    if (!match) {
      throw new Error('helytelen felhasználónév vagy jelszó');
    }

    if (felhasznalo.Fiokallapot === 'fuggoben') {
      throw new Error('a fiókját még nem hagyták jóvá');
    } else if (felhasznalo.Fiokallapot === 'kitiltva') {
      throw new Error('a fiókja ki van tiltva');
    } else if (felhasznalo.Fiokallapot === 'elutasitva') {
      felhasznalokTable.deleteFelhasznalo(felhasznalonev);
      throw new Error('a regisztrációját elutasították');
    }

    const szerep = felhasznalo.Szerep;
    loginUser(res, felhasznalonev, szerep, 2592000); // 30 napig ervenyes token
  } catch (err) {
    redirectWithMsg(req, res, '/login', `Hiba: ${err.message}`);
    return;
  }
  redirectWithMsg(req, res, '/', 'Sikeres bejelentkezés');
  // TODO ha a middleware iranyitotta a usert a login oldalra, akkor atiranyitani ot oda, ahova eredetileg szeretett volna menni, kulonben a fooldalra
});

export default router;
