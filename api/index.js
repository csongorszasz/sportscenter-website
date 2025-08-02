// REST API gyökér express routerének konfigurálása

import express from 'express';
import morgan from 'morgan';
import palyakRoutes from './palyak.js';
import kepekRoutes from './kepek.js';
import foglalasokRoutes from './foglalasok.js';
import felhasznalokRoutes from './felhasznalok.js';

const router = express.Router();

// loggoljuk csak az API kéréseket
router.use(morgan('dev'));

// minden testtel ellátott API hívás
// JSON-t tartalmaz
router.use(express.json());

// API endpointok a megfelelő alrouterbe
router.use('/palyak', palyakRoutes);
router.use('/kepek', kepekRoutes);
router.use('/foglalasok', foglalasokRoutes);
router.use('/felhasznalok', felhasznalokRoutes);

export default router;
