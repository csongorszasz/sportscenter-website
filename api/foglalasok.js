import express from 'express';
import * as foglalasokDao from '../db/foglalasok.js';
import * as palyakDao from '../db/sportpalyak.js';
import { authorize } from '../middleware/authorization.js';
import { getUserInfo } from '../utility/authorization.js';

const router = express.Router();

router.delete('/:palyaId/:felhasznalonev/:idopont', authorize(['diak', 'admin']), (req, res) => {
  const { palyaId, felhasznalonev, idopont } = req.params;

  const userInfo = getUserInfo(req);
  if (userInfo.role === 'diak' && userInfo.felhasznalonev !== felhasznalonev) {
    res.status(403).json({
      message: `Nem engedélyezett művelet: '${userInfo.felhasznalonev}' felhasználó csak saját foglalását törölheti`,
    });
    return;
  }

  foglalasokDao
    .deleteFoglalas(palyaId, felhasznalonev, idopont)
    .then((rows) =>
      rows
        ? res.sendStatus(204)
        : res.status(404).json({
            message: `Nem található foglalás a '${palyaId} pályára '${felhasznalonev} által, '${idopont}' idopontban`,
          }),
    )
    .catch((err) => {
      res.status(500).json({ message: 'Hiba a foglalás törlésekor' });
      console.log(
        `Hiba a [palyaId=${palyaId}; felhasznalonev=${felhasznalonev}; idopont=${idopont}] foglalás törlésekor: ${err.message}`,
      );
    });
});

// visszateriti a palya adott datumra szabad idopontjait (azaz azokat az orakat, amikre nincs foglalas)
router.get('/:palyaId/freehours/:date', (req, res) => {
  const { palyaId, date } = req.params;

  foglalasokDao
    .getOccupiedHours(palyaId, date)
    .then(async (occupiedHours) => {
      const [openingHour, closingHour] = await palyakDao.getOpeningAndClosingHours(palyaId);
      console.log(openingHour, closingHour);
      const freeHours = [];

      if (new Date().getDay() === new Date(date).getDay()) {
        const currentHour = new Date().getHours();
        for (let i = openingHour; i <= currentHour; i += 1) {
          occupiedHours.add(i);
        }
        console.log('Foglalt orak csak ma: ', occupiedHours); // a jelen oraig foglalt orak kiirasa
      }

      for (let i = openingHour; i < closingHour; i += 1) {
        if (!occupiedHours.has(i)) {
          freeHours.push(i);
        }
      }
      console.log('Szabad orak: ', freeHours); // szabad orak kiirasa
      res.json(freeHours);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Hiba a szabad időpontok lekérdezésekor' });
      console.log(`Hiba a [palyaId=${palyaId}; date=${date}] szabad időpontok lekérdezésekor: ${err.message}`);
    });
});

export default router;
