import express from "express";
import prisma from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Kullanıcı kaydı
router.post("/register", async (req, res) => {
  try {
    const { name, surname, email, password, profile_picture } = req.body;

    // Boş alan kontrolü
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    // E-posta daha önce kayıtlı mı kontrol et
    const userExists = await prisma.users.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı veritabanına ekle
    const newUser = await prisma.users.create({
      data: {
        name,
        surname,
        email,
        password: hashedPassword,
        profile_picture: profile_picture || null,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        profile_picture: true,
      },
    });

    res.json({ user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcı girişi
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı e-posta ile bul
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    // Şifreyi kontrol et
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Geçersiz şifre." });

    // Şifreyi göndermiyoruz
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcı bilgilerini getir
router.get("/userinfo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // ID ile kullanıcıyı getir
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        profile_picture: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcı bilgilerini güncelle
router.put("/userinfo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, surname, email, profile_picture } = req.body;

    // Boş alan kontrolü
    if (!name || !surname || !email) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    // Email başka kullanıcı tarafından kullanılmıyor mu kontrol et
    const emailCheck = await prisma.users.findFirst({
      where: { email, NOT: { id: parseInt(userId) } },
    });
    if (emailCheck) return res.status(400).json({ error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor." });

    // Veritabanında güncelle
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { name, surname, email, profile_picture },
      select: { id: true, name: true, surname: true, email: true, profile_picture: true },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Şifre değiştir
router.put("/changepassword/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Boş alan kontrolü
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Mevcut şifre ve yeni şifre gereklidir." });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: "Yeni şifre en az 6 karakter olmalıdır." });

    const user = await prisma.users.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    // Mevcut şifreyi kontrol et
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Eski şifreniz hatalı." });

    // Yeni şifre eski şifreyle aynı olamaz
    if (currentPassword === newPassword) return res.status(400).json({ error: "Yeni şifre eski şifreyle aynı olamaz." });

    // Yeni şifreyi hashle ve güncelle
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcıyı sil
router.delete("/userinfo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseInt(userId);

    // Kullanıcıyı assignee olan görevlerden çıkar
    await prisma.tasks.updateMany({ where: { assignee_id: uid }, data: { assignee_id: null } });

    // Kullanıcıyı sil
    const deletedUser = await prisma.users.delete({
      where: { id: uid },
      select: { id: true, name: true, surname: true, email: true },
    });

    res.json({ message: "Kullanıcı başarıyla silindi", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tüm kullanıcıları getir
router.get("/", async (req, res) => {
  try {
    // Tüm kullanıcıları seçilen alanlarla getir
    const users = await prisma.users.findMany({
      select: { id: true, name: true, surname: true, email: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
