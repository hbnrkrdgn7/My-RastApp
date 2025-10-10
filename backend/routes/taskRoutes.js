/**
 * Task route'ları
 * - CRUD operasyonları
 * - Controller fonksiyonlarını bağlar
 */

import express from "express";
import { getTasks, createTask, updateTask, deleteTask, } from "../controllers/taskController.js";

const router = express.Router();

// Task endpoint'leri
router.get("/:projectId", getTasks); // Proje görevlerini listele
router.post("/", createTask); // Yeni görev oluştur
router.put("/:id", updateTask); // Görev güncelle
router.delete("/:id", deleteTask); // Görev sil

export default router;
