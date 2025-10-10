/**
 * Task işlemleri controller'ı
 * - CRUD operasyonları
 * - SQL JOIN ile kullanıcı bilgileri
 */

import pool from "../db.js";

// Proje görevlerini listele (assignee bilgileri ile)
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Task'ları kullanıcı bilgileri ile birlikte getir
    const result = await pool.query(
      `SELECT 
         t.*, 
         CONCAT(u1.name, ' ', COALESCE(u1.surname, '')) AS created_by_name,
         CONCAT(u2.name, ' ', COALESCE(u2.surname, '')) AS updated_by_name,
         CONCAT(u3.name, ' ', COALESCE(u3.surname, '')) AS assigned_to_name,
         u3.profile_picture AS assigned_to_avatar
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.updated_by = u2.id
       LEFT JOIN users u3 ON t.assignee_id = u3.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Görevler alınamadı:", err);
    res.status(500).json({ error: err.message });
  }
};

// Yeni görev oluştur
export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, status, assignee_id, created_by } = req.body;
    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, assignee_id, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [project_id, title, description, status, assignee_id, created_by]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GÖREV GÜNCELLEME
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignee_id, updated_by } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           assignee_id = $4,
           updated_by = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, status, assignee_id, updated_by, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Task not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GÖREV SİLME
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
