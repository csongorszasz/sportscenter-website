import pool from './connection.js';
import { findImages } from './kepek.js';

// Promise-t terit vissza
export function insert(palyaTipus, oraber, cim, leiras, nyitas, zaras) {
  const query = 'INSERT INTO Sportpalyak VALUES (default, ?, ?, ?, ?, ?, ?)';
  return pool.query(query, [palyaTipus, oraber, cim, leiras, nyitas, zaras]);
}

export function findPalya(palyaId) {
  const query = 'SELECT * FROM Sportpalyak WHERE ID = ?';
  return pool.query(query, [palyaId]);
}

export async function findPalyaWithImages(palyaId) {
  const [palyak] = await findPalya(palyaId);
  const palya = palyak[0];
  const kepek = await findImages(palyaId);
  palya.Kepek = kepek;
  return palya;
}

export function findPalyak(palyaTipus, minOraber, maxOraber) {
  const query = 'SELECT * FROM Sportpalyak WHERE Tipus = ? AND Oraber BETWEEN ? AND ?';
  return pool.query(query, [palyaTipus, minOraber, maxOraber]);
}

export async function findPalyakWithImages(palyaTipus, minOraber, maxOraber) {
  const [palyak] = await findPalyak(palyaTipus, minOraber, maxOraber);
  return Promise.all(
    palyak.map(async (palya) => {
      const kepek = await findImages(palya.ID);
      palya.Kepek = kepek;
      return palya;
    }),
  );
}

export function findAllPalyak() {
  const query = 'SELECT * FROM Sportpalyak';
  return pool.query(query);
}

export async function findAllPalyakWithImages() {
  const [palyak] = await findAllPalyak();
  return Promise.all(
    palyak.map(async (palya) => {
      const kepek = await findImages(palya.ID);
      palya.Kepek = kepek;
      return palya;
    }),
  );
}

export async function existsPalya(palyaId) {
  const query = 'SELECT 1 FROM Sportpalyak WHERE ID = ?';
  const results = await pool.query(query, [palyaId]);
  return results.length > 0;
}

export async function getOpeningAndClosingHours(palyaId) {
  const query = 'SELECT Nyitas, Zaras FROM Sportpalyak WHERE ID = ?';
  const [palyak] = await pool.query(query, [palyaId]);
  const openingHour = parseInt(palyak[0].Nyitas, 10);
  const closingHour = parseInt(palyak[0].Zaras, 10);
  console.log(`Nyitvatartas: ${openingHour} ${closingHour}`); // nyitvatartas kiirasa
  return [openingHour, closingHour];
}
