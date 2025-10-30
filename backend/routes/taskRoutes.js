import express from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import prisma from "../db.js"; 

const router = express.Router();

// Kullanıcıya ait görevleri getir
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Kullanıcının atandığı görevleri al, ilişkili kullanıcı bilgilerini de getir
    const tasks = await prisma.tasks.findMany({
      where: { assignee_id: parseInt(userId) },
      orderBy: { created_at: "desc" },
      include: {
        users_tasks_created_byTousers: { select: { name: true, surname: true } },
        users_tasks_updated_byTousers: { select: { name: true, surname: true } },
        users_tasks_assignee_idTousers: {
          select: { name: true, surname: true, profile_picture: true }
        }
      }
    });

    // Görevleri frontend için formatla
    const formattedTasks = tasks.map((t) => ({
      ...t,
      created_by_name: t.users_tasks_created_byTousers
        ? `${t.users_tasks_created_byTousers.name} ${t.users_tasks_created_byTousers.surname || ""}`
        : null,
      updated_by_name: t.users_tasks_updated_byTousers
        ? `${t.users_tasks_updated_byTousers.name} ${t.users_tasks_updated_byTousers.surname || ""}`
        : null,
      assigned_to_name: t.users_tasks_assignee_idTousers
        ? `${t.users_tasks_assignee_idTousers.name} ${t.users_tasks_assignee_idTousers.surname || ""}`
        : null,
      assigned_to_avatar: t.users_tasks_assignee_idTousers
        ? t.users_tasks_assignee_idTousers.profile_picture
        : null,
    }));

    res.json(formattedTasks);
  } catch (err) {
    console.error("Kullanıcı görevleri alınamadı:", err);
    res.status(500).json({ error: err.message });
  }
});

// Proje ID ile tüm görevleri getir
router.get("/:projectId", getTasks);

// Yeni görev oluştur
router.post("/", createTask);

// Mevcut görevi güncelle
router.put("/:id", updateTask);

// Görevi sil
router.delete("/:id", deleteTask);

export default router;
