import express from 'express';
import fs from 'fs';
import * as kepekDao from '../db/kepek.js';
import { authorize } from '../middleware/authorization.js';

const router = express.Router();

// deleteByUrl
router.delete('/:url', authorize(['admin']), (req, res) => {
  const { url } = req.params;
  kepekDao
    .deleteImage(url)
    .then((rows) =>
      fs.unlink(`uploadDir/${url}`, (err) => {
        if (err) {
          res.status(500).json({ message: `Hiba a '${url}' kép törlésekor: ${err.message}` });
          return;
        }
        if (rows) {
          res.sendStatus(204);
        } else {
          res.status(404).json({ message: `Nem található kép '${url}' cimen.` });
        }
      }),
    )
    .catch((err) => res.status(500).json({ message: `Hiba a '${url}' kép törlésekor: ${err.message}` }));
});

export default router;
