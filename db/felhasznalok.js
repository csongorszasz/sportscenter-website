import pool from './connection.js';

export async function findAllDiakok() {
  const query = 'SELECT * FROM Felhasznalok WHERE Szerep = "diak"';
  const [results] = await pool.query(query);
  return results;
}

export async function findRegisteredDiakok() {
  const query = 'SELECT * FROM Felhasznalok WHERE Szerep = "diak" AND Fiokallapot = "ok" OR Fiokallapot = "kitiltva"';
  const [results] = await pool.query(query);
  return results;
}

export async function findByFelhasznalonev(felhasznalonev) {
  const query = 'SELECT * FROM Felhasznalok WHERE Felhasznalonev = ?';
  const [results] = await pool.query(query, [felhasznalonev]);
  return results[0];
}

export async function findAllFelhasznalonev() {
  const query = 'SELECT Felhasznalonev FROM Felhasznalok';
  const [res] = await pool.query(query);
  return res.map((row) => row.Felhasznalonev);
}

export async function existsFelhasznalonev(nev) {
  const query = 'SELECT 1 FROM Felhasznalok WHERE Felhasznalonev = ?';
  const [results] = await pool.query(query, [nev]);
  return results.length > 0;
}

export function insert(felhasznalonev, jelszo, szerep, fiokallapot) {
  const query = 'INSERT INTO Felhasznalok VALUES (default, ?, ?, ?, ?)';
  return pool.query(query, [felhasznalonev, jelszo, szerep, fiokallapot]);
}

export async function getHashedPassword(felhasznalonev) {
  const query = 'SELECT Jelszo FROM Felhasznalok WHERE Felhasznalonev = ?';
  const [results] = await pool.query(query, [felhasznalonev]);
  return results[0].Jelszo;
}

export async function getSzerep(felhasznalonev) {
  const query = 'SELECT Szerep FROM Felhasznalok WHERE Felhasznalonev = ?';
  const [results] = await pool.query(query, [felhasznalonev]);
  return results[0].Szerep;
}

export function updateFiokallapot(felhasznalonev, newFiokallapot) {
  const query = 'UPDATE Felhasznalok SET Fiokallapot = ? WHERE Felhasznalonev = ?';
  return pool.query(query, [newFiokallapot, felhasznalonev]);
}

export function deleteFelhasznalo(felhasznalonev) {
  const query = 'DELETE FROM Felhasznalok WHERE Felhasznalonev = ?';
  return pool.query(query, [felhasznalonev]);
}
