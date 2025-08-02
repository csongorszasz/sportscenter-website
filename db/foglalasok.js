import pool from './connection.js';

export function insert(felhasznalonev, palyaId, idopont, idotartam) {
  const query = 'INSERT INTO Foglalasok VALUES (default, ?, ?, ?, ?)';
  return pool.query(query, [felhasznalonev, palyaId, idopont, idotartam]);
}

export async function findAll() {
  const query = 'SELECT * FROM Foglalasok WHERE Idopont > NOW() ORDER BY Idopont ASC';
  const [foglalasok] = await pool.query(query);
  return foglalasok;
}

export async function findByFelhasznalonev(felhasznalonev) {
  const query = 'SELECT * FROM Foglalasok WHERE Felhasznalonev = ? AND Idopont > NOW() ORDER BY Idopont ASC';
  const [foglalasok] = await pool.query(query, [felhasznalonev]);
  return foglalasok;
}

export async function findByPalyaId(palyaId) {
  const query = 'SELECT * FROM Foglalasok WHERE PalyaID = ? AND Idopont > NOW() ORDER BY Idopont ASC';
  const [foglalasok] = await pool.query(query, [palyaId]);
  return foglalasok;
}

export async function findByPalyaIdAndFelhasznalonev(palyaId, felhasznalonev) {
  const query =
    'SELECT * FROM Foglalasok WHERE PalyaID = ? AND Felhasznalonev = ? AND Idopont > NOW() ORDER BY Idopont ASC';
  const [foglalasok] = await pool.query(query, [palyaId, felhasznalonev]);
  return foglalasok;
}

export function deleteFoglalas(palyaId, felhasznalonev, idopont) {
  const query = 'DELETE FROM Foglalasok WHERE PalyaID = ? AND Felhasznalonev = ? AND Idopont = ?';
  return pool.query(query, [palyaId, felhasznalonev, idopont]);
}

// visszaterit egy halmazt azokkal az orakkal, amikre van foglalas a megadott datumon, a megadott palyara
export async function getOccupiedHours(palyaId, date) {
  const query =
    'SELECT Idopont, Idotartam FROM Foglalasok WHERE PalyaID = ? AND Idopont > NOW() AND Idopont LIKE ? ORDER BY Idopont ASC';
  const [occupiedDatetimesWithDuration] = await pool.query(query, [palyaId, `${date}%`]);
  const occupiedHours = new Set();
  occupiedDatetimesWithDuration.forEach(({ Idopont, Idotartam }) => {
    const startHour = new Date(Idopont).getHours();
    const endHour = parseInt(startHour, 10) + Idotartam;
    for (let i = startHour; i < endHour; i += 1) {
      occupiedHours.add(i);
    }
  });
  console.log('Foglalt orak ', occupiedHours); // foglalt orak kiirasa
  return occupiedHours;
}
