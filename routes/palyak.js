import express from 'express';
import path from 'path';

import * as vd from '../utility/validator.js';
import { getUserInfo } from '../utility/authorization.js';
import { formatFoglalasok, formatPalya } from '../utility/formatting.js';

import * as sportpalyakTable from '../db/sportpalyak.js';
import * as foglalasokTable from '../db/foglalasok.js';

const router = express.Router();

// a feltoltott allomanyokat konnyen elerhetove tesszuk
router.use(express.static(path.join(process.cwd(), 'uploadDir')));

router.get('/:palyaId', async (req, res) => {
  const statusMessage = req.session.message;
  req.session.message = null;

  const palyaId = vd.validateInt(req.params.palyaId);
  if (Number.isNaN(palyaId)) {
    res.status(400).render('error', { message: `A megadott palyaId nem szám: ${palyaId}` });
    return;
  }
  try {
    const userInfo = getUserInfo(req);
    const palya = formatPalya(await sportpalyakTable.findPalyaWithImages(palyaId));
    let foglalasok = [];
    if (userInfo.role === 'admin') {
      foglalasok = formatFoglalasok(await foglalasokTable.findByPalyaId(palyaId));
    } else if (userInfo.role === 'diak') {
      foglalasok = formatFoglalasok(
        await foglalasokTable.findByPalyaIdAndFelhasznalonev(palyaId, userInfo.felhasznalonev),
      );
    }
    res.render('palya', {
      palya,
      foglalasok,
      statusMessage,
      userInfo,
    });
  } catch (err) {
    res.status(500).render('error', { message: `Hiba a lekérdezés során: ${err.message}` });
  }
});

export default router;
