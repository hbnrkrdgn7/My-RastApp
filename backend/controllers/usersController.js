import prisma from "../db.js";
import bcrypt from "bcryptjs";

// Kullanıcı kaydı
export const registerUser = async (req, res) => {
  try {
    const { name, surname, email, password, profile_picture } = req.body;
    if (!name || !surname || !email || !password)
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });

    const userExists = await prisma.users.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

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
};

// Kullanıcı girişi
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Geçersiz şifre." });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kullanıcı bilgilerini getir
export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
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
};

// Kullanıcı bilgilerini güncelle
export const updateUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, surname, email, profile_picture } = req.body;

    if (!name || !surname || !email)
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });

    const emailCheck = await prisma.users.findFirst({
      where: { email, NOT: { id: parseInt(userId) } },
    });
    if (emailCheck)
      return res
        .status(400)
        .json({ error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor." });

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { name, surname, email, profile_picture },
      select: { id: true, name: true, surname: true, email: true, profile_picture: true },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Şifre değiştir
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Mevcut şifre ve yeni şifre gereklidir." });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "Yeni şifre en az 6 karakter olmalıdır." });

    const user = await prisma.users.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Eski şifreniz hatalı." });
    if (currentPassword === newPassword)
      return res.status(400).json({ error: "Yeni şifre eskiyle aynı olamaz." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kullanıcıyı sil
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseInt(userId);

    await prisma.tasks.updateMany({ where: { assignee_id: uid }, data: { assignee_id: null } });
    const deletedUser = await prisma.users.delete({
      where: { id: uid },
      select: { id: true, name: true, surname: true, email: true },
    });

    res.json({ message: "Kullanıcı başarıyla silindi", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tüm kullanıcıları getir
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, name: true, surname: true, email: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
