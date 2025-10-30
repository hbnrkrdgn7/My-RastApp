import express from "express";
import { getProjects, createProject } from "../controllers/projectController.js";

const router = express.Router();

// Tüm projeleri listele
router.get("/", getProjects);

// Yeni proje oluştur
router.post("/", createProject);

export default router;
