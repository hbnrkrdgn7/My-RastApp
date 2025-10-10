/**
 * PostgreSQL veritabanı bağlantı konfigürasyonu
 */

import pkg from "pg";
const { Pool } = pkg;

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "RastApp",
  password: "Sistem_4455",
  port: 5432
});

export default pool;
