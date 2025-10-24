/**
 * Kullanıcı işlemleri route'ları
 * - Kayıt, giriş, profil yönetimi
 * - Şifre hashleme ve doğrulama
 */

import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Kullanıcı kaydı
router.post("/register", async (req, res) => {
  try {
    const { name, surname, email, password, profile_picture } = req.body;

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    // E-posta kontrolü
    const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, surname, email, password, profile_picture, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id, name, surname, email, profile_picture",
      [name, surname, email, hashedPassword, profile_picture || null]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Kullanıcı girişi
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Kullanıcı bulunamadı." });
    }

    const user = result.rows[0];
    // Şifre kontrolü
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Geçersiz şifre." });
    }

    delete user.password; // Şifreyi response'dan çıkar
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/userinfo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT id, name, surname, email, profile_picture FROM users WHERE id = $1::int",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👤 Kullanıcı bilgilerini güncelle
router.put("/userinfo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, surname, email, profile_picture } = req.body;
    
    console.log("🔹 PUT /userinfo çağrıldı");
    console.log("🔹 UserId:", userId);
    console.log("🔹 Body:", { name, surname, email });

    if (!name || !surname || !email) {
      console.log("❌ Eksik alanlar");
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    // Email kontrolü (kendi email'i hariç)
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2::int",
      [email, userId]
    );
    
    if (emailCheck.rows.length > 0) {
      console.log("❌ Email zaten kullanılıyor");
      return res.status(400).json({ error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor." });
    }

    console.log("🔹 Database güncellemesi yapılıyor...");
    const result = await pool.query(
      "UPDATE users SET name = $1, surname = $2, email = $3, profile_picture = $4 WHERE id = $5::int RETURNING id, name, surname, email, profile_picture",
      [name, surname, email, profile_picture, userId]
    );

    if (result.rows.length === 0) {
      console.log("❌ Kullanıcı bulunamadı");
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    console.log("✅ Güncelleme başarılı:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Şifre değiştir
router.put("/changepassword/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    console.log("🔹 PUT /changepassword çağrıldı");
    console.log("🔹 UserId:", userId);

    if (!currentPassword || !newPassword) {
      console.log("❌ Eksik alanlar");
      return res.status(400).json({ error: "Mevcut şifre ve yeni şifre gereklidir." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Yeni şifre en az 6 karakter olmalıdır." });
    }

    // Mevcut kullanıcıyı ve şifresini kontrol et
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1::int",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.log("❌ Kullanıcı bulunamadı");
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Mevcut şifreyi kontrol et
    const user = userResult.rows[0];
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
  console.log("❌ Mevcut şifre hatalı");
  return res.status(400).json({ error: "Eski şifreniz hatalı." });
}

if (currentPassword === newPassword) {
  console.log("❌ Yeni şifre eskiyle aynı olamaz");
  return res.status(400).json({ error: "Yeni şifre eski şifreyle aynı olamaz." });
}


    // Yeni şifreyi hashle
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    const updateResult = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2::int RETURNING id, name, surname, email",
      [hashedNewPassword, userId]
    );

    console.log("✅ Şifre başarıyla güncellendi");
    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (err) {
    console.log("❌ Şifre değiştirme hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Kullanıcıyı sil
router.delete("/userinfo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Kullanıcıya atanmış görevleri assignee_id null yap
    await pool.query("UPDATE tasks SET assignee_id = NULL WHERE assignee_id = $1::int", [userId]);

    // 2️⃣ Kullanıcıyı sil
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1::int RETURNING id, name, surname, email",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json({ message: "Kullanıcı başarıyla silindi", user: result.rows[0] });
  } catch (err) {
    console.error("Kullanıcı silme hatası:", err);
    res.status(500).json({ error: err.message });
  }
});


// 👇 Tüm kullanıcıları getir
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, surname, email FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
