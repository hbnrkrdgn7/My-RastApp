import express from "express";
import { getTasks, createTask, updateTask, deleteTask, getUserTasks } from "../controllers/taskController.js";
import prisma from "../db.js"; 

const router = express.Router();

// Kullanıcıya ait görevleri getir
router.get("/user/:userId", getUserTasks);

// Proje ID ile tüm görevleri getir
router.get("/:projectId", getTasks);

// Yeni görev oluştur
router.post("/", createTask);

// Mevcut görevi güncelle
router.put("/:id", updateTask);

// Görevi sil
router.delete("/:id", deleteTask);

export default router;
