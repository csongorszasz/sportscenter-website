import express from 'express';
import * as felhasznalokDao from '../db/felhasznalok.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

router.patch('/approve/:felhasznalonev', authorize(['admin']), (req, res) => {
  const { felhasznalonev } = req.params;
  felhasznalokDao
    .updateFiokallapot(felhasznalonev, 'ok')
    .then(() => res.sendStatus(204))
    .catch((err) => {
      console.log(`Szerver hiba: ${err.message}`);
      res.status(500).json({ message: 'Szerver hiba' });
    });
});

router.patch('/reject/:felhasznalonev', authorize(['admin']), (req, res) => {
  const { felhasznalonev } = req.params;
  felhasznalokDao
    .updateFiokallapot(felhasznalonev, 'elutasitva')
    .then(() => res.sendStatus(204))
    .catch((err) => {
      console.log(`Szerver hiba: ${err.message}`);
      res.status(500).json({ message: 'Szerver hiba' });
    });
});

router.patch('/ban/:felhasznalonev', authorize(['admin']), (req, res) => {
  const { felhasznalonev } = req.params;
  felhasznalokDao
    .updateFiokallapot(felhasznalonev, 'kitiltva')
    .then(() => res.sendStatus(204))
    .catch((err) => {
      console.log(`Szerver hiba: ${err.message}`);
      res.status(500).json({ message: 'Szerver hiba' });
    });
});

router.patch('/unban/:felhasznalonev', authorize(['admin']), (req, res) => {
  const { felhasznalonev } = req.params;
  felhasznalokDao
    .updateFiokallapot(felhasznalonev, 'ok')
    .then(() => res.sendStatus(204))
    .catch((err) => {
      console.log(`Szerver hiba: ${err.message}`);
      res.status(500).json({ message: 'Szerver hiba' });
    });
});

export default router;
