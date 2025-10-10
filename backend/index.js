/**
 * Express.js server ana dosyası
 * - CORS ayarları
 * - API route'ları
 * - Port 5000'de çalışır
 */

import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js"; // Task işlemleri
import usersRoutes from "./routes/users.js"; // Kullanıcı işlemleri

const app = express();

// CORS ayarları - farklı origin'lerden gelen isteklere izin ver
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.248:3000', 'http://10.0.2.2:3000'],
  credentials: true
}));

app.use(express.json()); // JSON parse için

// API route'ları
app.use("/api/tasks", taskRoutes);
app.use("/api/users", usersRoutes);

// Server'ı başlat
app.listen(5000, () => console.log(" Server running on port 5000"));


