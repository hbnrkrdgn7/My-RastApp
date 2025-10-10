# MyApp - Task Management System

Modern ve kullanıcı dostu bir görev yönetim sistemi. React Native frontend ve Express.js backend ile geliştirilmiştir.

## 🚀 Özellikler

### Kullanıcı Yönetimi
- ✅ Kullanıcı kaydı ve girişi
- ✅ Profil fotoğrafı seçimi (8 farklı avatar)
- ✅ Kullanıcı bilgilerini düzenleme
- ✅ Şifre değiştirme
- ✅ Kullanıcı silme (onay ile)

### Görev Yönetimi
- ✅ Görev oluşturma, düzenleme ve silme
- ✅ 4 farklı durum: Backlog, To Do, In Progress, Done
- ✅ Öncelik seviyeleri: Low, Medium, High
- ✅ Görev atama (assignee)
- ✅ Görev detayları görüntüleme
- ✅ Tarih ve durum takibi

### UI/UX Özellikleri
- ✅ Modern ve responsive tasarım
- ✅ Mor tema (#7b2ff7)
- ✅ Profil fotoğrafları ile assignee gösterimi
- ✅ Kullanıcı dostu modal'lar
- ✅ Smooth animasyonlar

## 🛠️ Teknolojiler

### Frontend
- **React Native** - Mobil uygulama framework'ü
- **JavaScript (ES6+)** - Programlama dili
- **AsyncStorage** - Yerel veri saklama
- **Axios** - HTTP istekleri

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Veritabanı
- **bcryptjs** - Şifre hashleme
- **CORS** - Cross-origin resource sharing

## 📱 Kurulum

### Gereksinimler
- Node.js (v16+)
- PostgreSQL
- React Native CLI
- Android Studio / Xcode (emülatör için)

### Backend Kurulumu
```bash
cd backend
npm install
npm run dev
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npx react-native run-android  # Android için
npx react-native run-ios      # iOS için
```

## 🗄️ Veritabanı

### Tablolar
- **users**: Kullanıcı bilgileri
- **tasks**: Görev bilgileri
- **projects**: Proje bilgileri

### Migration
```bash
cd backend
node run-migration.js
```

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks/:projectId` - Proje görevlerini listele
- `POST /api/tasks` - Yeni görev oluştur
- `PUT /api/tasks/:id` - Görev güncelle
- `DELETE /api/tasks/:id` - Görev sil

### Users
- `POST /api/users/register` - Kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi
- `GET /api/users/userinfo/:userId` - Kullanıcı bilgileri
- `PUT /api/users/userinfo/:userId` - Kullanıcı güncelle
- `DELETE /api/users/userinfo/:userId` - Kullanıcı sil
- `PUT /api/users/changepassword/:userId` - Şifre değiştir

## 📝 Postman Test Komutları

### Task Listeleme
```
GET http://192.168.0.248:5000/api/tasks/1
```

### Yeni Task Oluşturma
```
POST http://192.168.0.248:5000/api/tasks
Content-Type: application/json

{
  "title": "Yeni Task",
  "description": "Açıklama",
  "status": "Backlog",
  "priority": "Medium",
  "assignee_id": 1,
  "project_id": 1,
  "created_by": 1
}
```

### Task Güncelleme
```
PUT http://192.168.0.248:5000/api/tasks/1
Content-Type: application/json

{
  "title": "Güncellenmiş Task",
  "description": "Yeni açıklama",
  "status": "In Progress",
  "assignee_id": 2,
  "updated_by": 1
}
```

### Task Silme
```
DELETE http://192.168.0.248:5000/api/tasks/1
```

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Ana Renk**: #7b2ff7 (Mor)
- **Arka Plan**: #ffffff (Beyaz)
- **Metin**: #111111 (Koyu gri)
- **İkincil Metin**: #666666 (Orta gri)

### Bileşenler
- Modern card tasarımı
- Rounded corner'lar
- Shadow efektleri
- Smooth transitions
- Responsive layout

## 🔧 Geliştirme

### Proje Yapısı
```
MyApp/
├── frontend/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── TaskDetail.js
│   │   └── AddTaskModal.js
│   └── services/
│       └── api.js
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── migrations/
│   └── index.js
└── README.md
```

### Debugging
- Backend logları: `console.log` ile takip
- Frontend debug: React Native debugger
- Network istekleri: Axios interceptors

## 📱 Ekran Görüntüleri

### Ana Ekran
- 4 kolonlu kanban board
- Görev kartları assignee bilgileri ile
- Modern ve temiz tasarım

### Görev Detayı
- Tam görev bilgileri
- Assignee profil fotoğrafı
- Düzenleme ve silme butonları

### Kullanıcı Ayarları
- Profil bilgileri düzenleme
- Şifre değiştirme
- Avatar seçimi

## 🚀 Gelecek Özellikler

- [ ] Drag & drop görev taşıma
- [ ] Görev filtreleme ve arama
- [ ] Bildirim sistemi
- [ ] Takım yönetimi
- [ ] Gelişmiş raporlama
- [ ] Dark mode desteği

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın



Bu proje MIT lisansı altında lisanslanmıştır.


Proje Sahibi: [Hibe Kara]

---

**Not**: Bu proje eğitim ve geliştirme amaçlıdır. Production kullanımı için ek güvenlik önlemleri alınması önerilir.
