import axios from "axios";

const API_URL = "http://192.168.0.248:5000/api";

// Belirli proje altındaki görevleri getir
export const getTasks = async (projectId, status = null, page = 1, limit = 10) => {
  const params = { page, limit };
  if (status) params.status = status; // status parametresi varsa ekle
  const res = await axios.get(`${API_URL}/tasks/${projectId}`, { params });
  return res.data; // Görev listesini döndür
};

// Yeni görev oluştur
export const createTask = async (task) => {
  const res = await axios.post(`${API_URL}/tasks`, task);
  return res.data; // Oluşturulan görevi döndür
};

// Mevcut görevi güncelle
export const updateTask = async (id, task) => {
  const res = await axios.put(`${API_URL}/tasks/${id}`, task);
  return res.data; // Güncellenmiş görevi döndür
};

// Görevi sil
export const deleteTask = async (id) => {
  const res = await axios.delete(`${API_URL}/tasks/${id}`);
  return res.data; // Silme sonucunu döndür
};

// USER API FUNCTIONS 

// Yeni kullanıcı kaydı
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/users/register`, data);
  return res.data; // Kayıt sonucu
};

// Kullanıcı girişi
export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/users/login`, data);
  return res.data; // Giriş sonucu ve kullanıcı bilgileri
};

// Kullanıcı bilgilerini getir
export const fetchUserInfo = async (userId) => {
  try {
    if (!userId) throw new Error("Geçersiz kullanıcı ID");
    const res = await axios.get(`${API_URL}/users/userinfo/${userId}`);
    return res.data; // Kullanıcı bilgilerini döndür
  } catch (err) {
    console.error("Kullanıcı bilgisi alınamadı:", err.response?.data || err.message);
    throw err; // Hata varsa fırlat
  }
};
