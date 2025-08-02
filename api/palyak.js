import express from 'express';
import * as palyakDao from '../db/sportpalyak.js';
import { formatPalya } from '../utility/formatting.js';

const router = express.Router();

// findById
router.get('/:palyaId', (req, res) => {
  const { palyaId } = req.params;
  palyakDao
    .findPalya(palyaId)
    .then((response) => {
      let palya = response[0][0];
      if (!palya) {
        res.status(404).json({ message: `Nem található pálya '${palyaId}' ID-val.` });
        return;
      }
      palya = formatPalya(palya);
      res.json(palya);
    })
    .catch((err) =>
      res.status(500).json({ message: `Hiba a '${palyaId}' ID-jú pálya keresése közben: ${err.message}` }),
    );
});

export default router;
