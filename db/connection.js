import mysql from 'mysql2/promise.js';

const pool = mysql.createPool({
  connectionLimit: 10,
  database: 'projekt',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'HnsAdrt0WtynpKJd',
});

export default pool;
