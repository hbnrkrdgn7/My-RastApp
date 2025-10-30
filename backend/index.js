import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js"; 
import usersRoutes from "./routes/users.js"; 

const app = express();

// CORS ayarları: hangi frontend URL'lerinden istek kabul edilecek
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.247:3000', 'http://10.0.2.2:3000'],
  credentials: true
}));

// JSON body parser: gelen requestlerin JSON olarak okunabilmesi için
app.use(express.json()); 

// Route tanımlamaları
app.use("/api/tasks", taskRoutes); 
app.use("/api/users", usersRoutes);

// Server başlatma
app.listen(5000, () => console.log("Server running on port 5000"));
