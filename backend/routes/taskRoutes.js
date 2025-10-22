import express from "express";
import pool from "../db.js"; // pool'u unutma
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

// Kullanıcıya atanmış görevleri getir
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching tasks for user:", userId);

    const result = await pool.query(
      "SELECT * FROM tasks WHERE assignee_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user tasks:", err);
    res.status(500).json({ error: err.message });
  }
});


// 📁 Proje görevlerini listele
router.get("/:projectId", getTasks);

// ✏️ Diğer CRUD işlemleri
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
