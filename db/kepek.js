import path from 'path';
import pool from './connection.js';

// Promise-t terit vissza
export function insert(palyaId, filepath) {
  const query = 'INSERT INTO Kepek VALUES (default, ?, ?)';
  return pool.query(query, [palyaId, path.basename(filepath)]);
}

export async function findImages(palyaId) {
  const query = 'SELECT Nev FROM Kepek WHERE PalyaID = ?';
  let [kepek] = await pool.query(query, [palyaId]);
  kepek = kepek.map((kep) => kep.Nev);
  return kepek;
}

export function deleteImage(url) {
  const query = 'DELETE FROM Kepek WHERE Nev = ?';
  return pool.query(query, [url]);
}
