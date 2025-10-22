/**
 * api.js
 * 
 * Backend API çağrılarını yöneten servis dosyası
 * - Axios ile HTTP istekleri
 * - Task CRUD işlemleri
 * - User authentication ve management
 * - Error handling
 */

import axios from "axios";

const API_URL = "http://192.168.0.248:5000/api"; // Backend API base URL

// TASK API FUNCTIONS 

/**
 * Belirli proje altındaki görevleri getir
 * @param {number} projectId - Proje ID'si
 * @returns {Promise<Array>} Görev listesi
 */
export const getTasks = async (projectId) => {
  const res = await axios.get(`${API_URL}/tasks/${projectId}`);
  return res.data;
};

/**
 * Yeni görev oluştur
 * @param {Object} task - Görev objesi
 * @returns {Promise<Object>} Oluşturulan görev
 */
export const createTask = async (task) => {
  const res = await axios.post(`${API_URL}/tasks`, task);
  return res.data;
};

/**
 * Mevcut görevi güncelle
 * @param {number} id - Görev ID'si
 * @param {Object} task - Güncellenecek görev verileri
 * @returns {Promise<Object>} Güncellenen görev
 */
export const updateTask = async (id, task) => {
  const res = await axios.put(`${API_URL}/tasks/${id}`, task);
  return res.data;
};

/**
 * Görevi sil
 * @param {number} id - Görev ID'si
 * @returns {Promise<Object>} Silme sonucu
 */
export const deleteTask = async (id) => {
  const res = await axios.delete(`${API_URL}/tasks/${id}`);
  return res.data;
};

// USER API FUNCTIONS 

/**
 * Yeni kullanıcı kaydı
 * @param {Object} data - Kullanıcı kayıt verileri
 * @returns {Promise<Object>} Kayıt sonucu
 */
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/users/register`, data);
  return res.data;
};

/**
 * Kullanıcı girişi
 * @param {Object} data - Giriş verileri (email, password)
 * @returns {Promise<Object>} Giriş sonucu ve kullanıcı bilgileri
 */
export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/users/login`, data);
  return res.data;
};

/**
 * Kullanıcı bilgilerini getir
 * @param {number} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} Kullanıcı bilgileri
 */
export const fetchUserInfo = async (userId) => {
  try {
    if (!userId) throw new Error("Geçersiz kullanıcı ID");
    const res = await axios.get(`${API_URL}/users/userinfo/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Kullanıcı bilgisi alınamadı:", err.response?.data || err.message);
    throw err;
  }
};
