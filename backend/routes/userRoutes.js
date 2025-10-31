import express from "express";
import {
  registerUser,
  loginUser,
  getUserInfo,
  updateUserInfo,
  changePassword,
  deleteUser,
  getAllUsers,
} from "../controllers/usersController.js";

const router = express.Router(); 

// Yeni kullanıcı kaydı
router.post("/register", registerUser);

// Kullanıcı girişi
router.post("/login", loginUser); 

// Belirli bir kullanıcının bilgilerini getir
router.get("/userinfo/:userId", getUserInfo); 

// Kullanıcı bilgilerini güncelle
router.put("/userinfo/:userId", updateUserInfo); 

// Kullanıcının şifresini değiştir
router.put("/changepassword/:userId", changePassword); 

// Kullanıcıyı sil
router.delete("/userinfo/:userId", deleteUser); 

// Tüm kullanıcıları listele
router.get("/", getAllUsers); 

export default router; 
