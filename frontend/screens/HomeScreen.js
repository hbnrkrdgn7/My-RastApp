/**
 * HomeScreen.js
 * 
 * Ana görev yönetim ekranı
 * - Tüm görevleri listeleme ve durumlarına göre gruplama (Backlog, In Progress, Done)
 * - Görev ekleme, düzenleme ve detay görüntüleme işlemleri
 * - Kullanıcı bilgilerini görüntüleme, güncelleme ve silme fonksiyonları
 * - Şifre değiştirme ve profil fotoğrafı seçme özellikleri
 * - Arama çubuğu ve görev filtreleme desteği
 * - API ile kullanıcı ve görev verilerini senkronize etme
 */

import React, { useEffect, useState } from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Modal,TextInput,ScrollView,Image,Alert,Linking} from "react-native";
import { getTasks } from "../services/api";
import AddTaskModal from "./AddTaskModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import TaskDetail from "./TaskDetail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const HomeScreen = ({ navigation }) => {
   // State tanımları
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', surname: '', email: '', profile_picture: '' });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const projectId = 1;

  // Profil fotoğrafı seçenekleri
  const avatarOptions = [
    "https://cdn-icons-png.flaticon.com/512/219/219983.png", // Erkek avatar
    "https://cdn-icons-png.flaticon.com/512/219/219970.png", // Kadın avatar
    "https://cdn-icons-png.flaticon.com/512/219/219968.png", // Erkek avatar 2
    "https://cdn-icons-png.flaticon.com/512/219/219964.png", // Kadın avatar 2
    "https://cdn-icons-png.flaticon.com/512/219/219960.png", // Erkek avatar 3
    "https://cdn-icons-png.flaticon.com/512/219/219956.png", // Kadın avatar 3
    "https://cdn-icons-png.flaticon.com/512/219/219971.png", // Erkek avatar 4
    "https://cdn-icons-png.flaticon.com/512/219/219974.png", // Kadın avatar 4
  ];

    const handleLogoPress = () => {
    Linking.openURL("https://www.rastmobile.com/tr");
  };
    //  Ekran açıldığında görevleri getir
  useEffect(() => {
    fetchTasks();
  }, []);

const handleUserInfoPress = async () => {
  console.log("🔹 handleUserInfoPress çağrıldı!"); // Debug için
  try {
    const userId = await AsyncStorage.getItem("userId");
    console.log("🔹 UserId:", userId); // Debug için
    if (!userId) {
      console.log("UserId yok");
      Alert.alert("Hata", "Kullanıcı ID bulunamadı!");
      return;
    }

    console.log("🔹 API çağrısı yapılıyor..."); // Debug için
    
    // Farklı URL'leri dene
    const baseUrls = [
      'http://192.168.0.247:5000', // Gerçek IP adresi
      'http://10.0.2.2:5000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];
    
    let res = null;
    let lastError = null;
    
    for (const baseUrl of baseUrls) {
      try {
        const apiUrl = `${baseUrl}/api/users/userinfo/${userId}`;
        console.log("🔹 Denenen URL:", apiUrl);
        
        res = await axios.get(apiUrl, {
          timeout: 5000, // 5 saniye timeout
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log("✅ Başarılı URL:", apiUrl);
        break; // Başarılı olursa döngüden çık
      } catch (error) {
        console.log("❌ Başarısız URL:", baseUrl, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!res) {
      throw lastError || new Error('Hiçbir URL çalışmıyor');
    }

    // Gelen kullanıcı bilgilerini state’e kaydet
    setUserInfo(res.data);
    setEditForm({
      name: res.data.name,
      surname: res.data.surname,
      email: res.data.email,
      profile_picture: res.data.profile_picture
    });
    setShowUserInfoModal(true); // kullanıcı modalını aç
    setShowSettingsModal(false); // ayarlar modalını kapat
    console.log("🔹 Modal açıldı!"); // Debug için
  } catch (err) {
    console.log("❌ Kullanıcı bilgisi alınamadı:", err);
    console.log("❌ Hata detayı:", err.response?.data || err.message);
    console.log("❌ Hata status:", err.response?.status);
    Alert.alert("Hata", `Kullanıcı bilgileri alınamadı! Hata: ${err.message}`);
  }
  };

//  Kullanıcı bilgilerini güncelle
const handleUpdateUser = async () => {
  console.log("🔹 handleUpdateUser çağrıldı!");
  console.log("🔹 EditForm:", editForm);
  
  try {
    const userId = await AsyncStorage.getItem("userId");
    console.log("🔹 UserId:", userId);
    
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı ID bulunamadı!");
      return;
    }

    const baseUrls = [
      'http://192.168.0.247:5000',
      'http://10.0.2.2:5000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];

    let res = null;
    let lastError = null;

    for (const baseUrl of baseUrls) {
      try {
        const apiUrl = `${baseUrl}/api/users/userinfo/${userId}`;
        console.log("🔹 Güncelleme URL:", apiUrl);
        console.log("🔹 Gönderilen data:", editForm);
        
        res = await axios.put(apiUrl, editForm, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log("✅ Güncelleme başarılı:", res.data);
        break;
      } catch (error) {
        console.log("❌ Güncelleme hatası:", baseUrl, error.message);
        console.log("❌ Hata detayı:", error.response?.data);
        lastError = error;
        continue;
      }
    }

    if (!res) {
      throw lastError || new Error('Hiçbir URL çalışmıyor');
    }

    setUserInfo(res.data);
    setIsEditing(false);
    Alert.alert("Başarılı", "Kullanıcı bilgileri güncellendi!");
  } catch (err) {
    console.log("❌ Genel güncelleme hatası:", err);
    Alert.alert("Hata", `Güncelleme başarısız: ${err.message}`);
  }
};

//  Kullanıcıyı sil
const handleDeleteUser = async () => {
  Alert.alert(
    "Kullanıcıyı Sil",
    "Kullanıcı hesabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!",
    [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
              Alert.alert("Hata", "Kullanıcı ID bulunamadı!");
              return;
            }

            const baseUrls = [
              'http://192.168.0.247:5000',
              'http://10.0.2.2:5000',
              'http://localhost:5000',
              'http://127.0.0.1:5000'
            ];

            let res = null;
            let lastError = null;

            for (const baseUrl of baseUrls) {
              try {
                const apiUrl = `${baseUrl}/api/users/userinfo/${userId}`;
                res = await axios.delete(apiUrl, { timeout: 5000 });
                break;
              } catch (error) {
                lastError = error;
                continue;
              }
            }

            if (!res) {
              throw lastError || new Error('Hiçbir URL çalışmıyor');
            }

            // Kullanıcı silindi, çıkış yap
            await AsyncStorage.removeItem("userId");
            setShowUserInfoModal(false);
            Alert.alert("Başarılı", "Hesabınız silindi. Çıkış yapılıyor...");
            navigation.navigate("Login");
          } catch (err) {
            Alert.alert("Hata", `Silme başarısız: ${err.message}`);
          }
        }
      }
    ]
  );
};

//  Şifre değiştir
const handleChangePassword = async () => {
  console.log("🔹 handleChangePassword çağrıldı!");
  
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      Alert.alert("Hata", "Kullanıcı ID bulunamadı!");
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert("Hata", "Tüm alanları doldurun!");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Hata", "Yeni şifreler eşleşmiyor!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalıdır!");
      return;
    }

    const apiUrl = `http://192.168.0.247:5000/api/users/changepassword/${userId}`;
    console.log("🔹 Şifre değiştirme URL:", apiUrl);

    const res = await axios.put(apiUrl, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });

    console.log("✅ Şifre değiştirme başarılı:", res.data);
    Alert.alert("Başarılı", res.data.message || "Şifre başarıyla değiştirildi!");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

  } catch (error) {
    console.log("❌ Şifre değiştirme hatası:", error.message);
    console.log("❌ Hata response:", error.response?.data);

    const hataMesaji = error.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyin.";
    Alert.alert("Hata", hataMesaji);
  }
};


  //  Görevleri çek ve en yeniyi başa al
  const fetchTasks = async () => {
    try {
      const res = await getTasks(projectId);
      const sorted = res.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTasks(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  //  Modal kapatıldığında yeni/güncel görev varsa başa ekle
  const handleTaskUpdate = (newOrUpdatedTask) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== newOrUpdatedTask.id);
      return [newOrUpdatedTask, ...filtered];
    });
  };

  const groupedTasks = (status) => {
    const filtered = searchText
      ? tasks.filter(
          (t) =>
            t.status === status &&
            t.title.toLowerCase().includes(searchText.toLowerCase())
        )
      : tasks.filter((t) => t.status === status);
    return filtered;
  };

    // renderTask: tüm FlatList'ler için ortak render fonksiyonu
  const renderTask = ({ item }) => {
    const statusStyle =
      item.status === "Done"
        ? styles.statusDone
        : item.status === "In Progress"
        ? styles.statusProgress
        : item.status === "Backlog"
        ? styles.statusBacklog
        : styles.statusTodo;

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => setSelectedTask(item)}
      >
        {/* BAŞLIK */}
        <Text style={styles.taskTitle}>{item.title}</Text>

        {/* AÇIKLAMA */}
        <Text style={styles.taskDescription} numberOfLines={3}>
          {item.description || "No description available."}
        </Text>

        {/* ASSIGNEE (açıklamanın altında) */}
        {item.assigned_to_name && (
          <View style={styles.assigneeTag}>
            {item.assigned_to_avatar ? (
              <Image source={{ uri: item.assigned_to_avatar }} style={styles.assigneeAvatar} />
            ) : (
              <View style={styles.assigneeIcon}>
                <Text style={styles.assigneeIconText}>👤</Text>
              </View>
            )}
            <Text style={styles.assigneeText} numberOfLines={1}>
              {item.assigned_to_name}
            </Text>
          </View>
        )}


        {/* FOOTER: tarih + status */}
        <View style={styles.taskFooter}>
          <Text style={styles.taskDate}>
            📅 {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text
            style={[
              styles.statusBadge,
              statusStyle,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
  <View style={styles.headerLeft}>
  <TouchableOpacity onPress={handleLogoPress}>
    <Image
      source={require("../assets/rast-mobile-logo1.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>


  {showSearch ? (
  <TextInput
    style={styles.searchInput}
    placeholder="Search..."
    value={searchText}
    onChangeText={(text) => {
      setSearchText(text);
    }}
    onSubmitEditing={() => {
      // Arama yapılınca arama kutusunu kapat
      setShowSearch(false);
    }}
    autoFocus={true}
    placeholderTextColor="#ccc"
  />
) : (
  <View style={styles.headerIcons}>
    <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
      <Ionicons name="search-outline" size={24} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity
  onPress={() => {
    console.log("🔹 Ayarlar butonuna tıklandı!"); // Debug için
    setShowSettingsModal(true);
  }}
>
  <Ionicons name="settings-outline" size={24} color="#fff" />
</TouchableOpacity>

  </View>
)}

{/* AYARLAR MODALI */}
<Modal
  visible={showSettingsModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowSettingsModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.settingsModal}>
      {/* Sağ üstte X ikonu */}
      <TouchableOpacity
        style={styles.closeIconContainer}
        onPress={() => setShowSettingsModal(false)}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>⚙️ Ayarlar</Text>
      </View>

      {/* Seçenekler */}
      <View style={styles.settingsOptions}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleUserInfoPress}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>👤</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.settingsButtonText}>Kullanıcı Bilgileri</Text>
              <Text style={styles.settingsButtonSubtext}>Profil bilgilerinizi görüntüleyin ve düzenleyin</Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowPasswordModal(true)}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🔐</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.settingsButtonText}>Şifre Değiştir</Text>
              <Text style={styles.settingsButtonSubtext}>Hesap şifrenizi güvenli şekilde değiştirin</Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsButton, styles.logoutButton]}
          onPress={async () => {
            Alert.alert(
              "Çıkış Yap",
              "Uygulamadan çıkmak istediğinizden emin misiniz?",
              [
                { text: "İptal", style: "cancel" },
                {
                  text: "Çıkış Yap",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.removeItem("userId");
                    setShowSettingsModal(false);
                    navigation.navigate("Login");
                  }
                }
              ]
            );
          }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🚪</Text>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.settingsButtonText, { color: "#fff" }]}>Çıkış Yap</Text>
              <Text style={[styles.settingsButtonSubtext, { color: "#ffebee" }]}>Hesabınızdan güvenli şekilde çıkın</Text>
            </View>
            <Text style={[styles.arrowIcon, { color: "#fff" }]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


{/* KULLANICI BİLGİLERİ MODALI */}
<Modal
  visible={showUserInfoModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowUserInfoModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.userInfoModal}>
      {/* Sağ üstte X ikonu */}
      <TouchableOpacity
        style={styles.closeIconContainer}
        onPress={() => {
          setShowUserInfoModal(false);
          setIsEditing(false);
        }}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      {/* Header Gradient */}
      <View style={styles.modalHeader}>
        <Text style={styles.userInfoTitle}>👤 Kullanıcı Bilgileri</Text>
      </View>
      
      {userInfo ? (
        isEditing ? (
          // Düzenleme modu
          <View style={styles.editForm}>
            <TextInput
              style={styles.editInput}
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
              placeholder="Ad"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.editInput}
              value={editForm.surname}
              onChangeText={(text) => setEditForm({...editForm, surname: text})}
              placeholder="Soyad"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.editInput}
              value={editForm.email}
              onChangeText={(text) => setEditForm({...editForm, email: text})}
              placeholder="E-posta"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
            
            {/* Profil Fotoğrafı Seçimi */}
            <Text style={styles.avatarLabel}>👤 Profil Fotoğrafı</Text>
            <TouchableOpacity 
              style={styles.avatarSelector}
              onPress={() => setShowAvatarPicker(true)}
            >
              {editForm.profile_picture ? (
                <Image source={{ uri: editForm.profile_picture }} style={styles.avatarPreview} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>Fotoğraf Seç</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={handleUpdateUser}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Görüntüleme modu
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>👤 Ad: {userInfo.name}</Text>
            <Text style={styles.userInfoText}>👤 Soyad: {userInfo.surname}</Text>
            <Text style={styles.userInfoText}>📧 E-posta: {userInfo.email}</Text>
            
            {/* Alt butonlar */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editActionButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editActionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteActionButton]}
                onPress={handleDeleteUser}
              >
                <Text style={styles.deleteActionButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      ) : (
        <Text>Bilgiler yükleniyor...</Text>
      )}
    </View>
  </View>
</Modal>

{/* AVATAR PICKER MODAL */}
<Modal
  visible={showAvatarPicker}
  transparent
  animationType="fade"
  onRequestClose={() => setShowAvatarPicker(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.avatarPickerModal}>
      {/* Header */}
      <View style={styles.avatarPickerHeader}>
        <Text style={styles.avatarPickerTitle}>👤 Profil Fotoğrafı Seçin</Text>
        <TouchableOpacity
          style={styles.avatarPickerClose}
          onPress={() => setShowAvatarPicker(false)}
        >
          <Text style={styles.avatarPickerCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Grid */}
      <View style={styles.avatarPickerGrid}>
        {avatarOptions.map((avatar, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.avatarPickerOption,
              editForm.profile_picture === avatar && styles.avatarPickerSelected
            ]}
            onPress={() => {
              setEditForm({...editForm, profile_picture: avatar});
              setShowAvatarPicker(false);
            }}
          >
            <Image source={{ uri: avatar }} style={styles.avatarPickerImage} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
</Modal>

{/* ŞİFRE DEĞİŞTİRME MODALI */}
<Modal
  visible={showPasswordModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowPasswordModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.passwordModal}>
      {/* Header */}
      <View style={styles.passwordHeader}>
        <Text style={styles.passwordTitle}>🔐 Şifre Değiştir</Text>
        <TouchableOpacity
          style={styles.passwordClose}
          onPress={() => {
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }}
        >
          <Text style={styles.passwordCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.passwordForm}>
        <TextInput
          style={styles.passwordInput}
          value={passwordForm.currentPassword}
          onChangeText={(text) => setPasswordForm({...passwordForm, currentPassword: text})}
          placeholder="Mevcut Şifre"
          placeholderTextColor="#999"
          secureTextEntry
        />
        
        <TextInput
          style={styles.passwordInput}
          value={passwordForm.newPassword}
          onChangeText={(text) => setPasswordForm({...passwordForm, newPassword: text})}
          placeholder="Yeni Şifre"
          placeholderTextColor="#999"
          secureTextEntry
        />
        
        <TextInput
          style={styles.passwordInput}
          value={passwordForm.confirmPassword}
          onChangeText={(text) => setPasswordForm({...passwordForm, confirmPassword: text})}
          placeholder="Yeni Şifre Tekrar"
          placeholderTextColor="#999"
          secureTextEntry
        />
        
        <View style={styles.passwordButtons}>
          <TouchableOpacity
            style={[styles.passwordButton, styles.passwordCancelButton]}
            onPress={() => {
              setShowPasswordModal(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
          >
            <Text style={styles.passwordCancelButtonText}>İptal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.passwordButton, styles.passwordSaveButton]}
            onPress={handleChangePassword}
          >
            <Text style={styles.passwordSaveButtonText}>Değiştir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
</Modal>


</View>


      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROJECT TITLE */}
        <View style={styles.projectHeader}>
          <View style={styles.projectIcon}>
            <Ionicons name="code-slash" size={20} color="#7b2ff7" />
          </View>

          <View style={styles.projectText}>
            <Text style={styles.projectTitle}>Refactoring for Word Ninja</Text>
            <Text style={styles.projectSubtitle}>
              New project for refactoring our app Word Ninja
            </Text>
          </View>
        </View>

        {/* BACKLOG */}
        <Text style={styles.section}>Backlog</Text>
        <FlatList
          data={groupedTasks("Backlog")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
        />

        {/* TO DO */}
        <Text style={styles.section}>To Do</Text>
        <FlatList
          data={groupedTasks("To Do")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
        />

        {/* IN PROGRESS */}
        <Text style={styles.section}>In Progress</Text>
        <FlatList
          data={groupedTasks("In Progress")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
        />

        {/* DONE */}
        <Text style={styles.section}>Done</Text>
        <FlatList
          data={groupedTasks("Done")}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
        />
      </ScrollView>

      {/* ADD TASK BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* ADD TASK MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <AddTaskModal
          onClose={() => setShowModal(false)}
          refresh={fetchTasks}
          onTaskAdded={handleTaskUpdate} // 🔹 yeni/güncel task başa eklenecek
        />
      </Modal>

      {/* TASK DETAIL MODAL */}
      <Modal
        visible={!!selectedTask}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTask(null)}
      >
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          refresh={fetchTasks}
        />
      </Modal>

      {/* FOOTER */}
      <View style={styles.footerContainer}>
  <Ionicons name="home-outline" size={24} color="#000" />
  
  <TouchableOpacity
    onPress={() => Linking.openURL("https://www.rastmobile.com/tr/urunler/word-ninja")}
  >
    <Text style={styles.linkButton}>Go to Word Ninja</Text>
  </TouchableOpacity>
</View>
    </View>
  );
};

// ---------- STYLE ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },

  headerLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

logo: {
  width: 110,
  height: 110,
  marginTop: 0,
},

  projectHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 20,
    marginBottom: 8,
    marginTop: 10,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#E8E2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  projectText: {
    justifyContent: "center",
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginTop: 5,

  },
  projectSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  headerContainer: {
    backgroundColor: "#7b2ff7",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", gap: 20 },
headerLeft: {
  flexDirection: "row",
  alignItems: "center", // ✅ logoyu dikeyde ortalar
  gap: 8,
},
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: "#000",
  },

  section: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 14,
    marginLeft: 20,
    color: "#555",
  },

  flatListContent: { paddingHorizontal: 20 },

  taskCard: {
    position: "relative",
    width: 280,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    justifyContent: "space-between",
  },
  assigneeTag: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#7b2ff7",
  paddingHorizontal: 6,
  paddingVertical: 4,
  borderRadius: 12,
  marginTop: 8,
  alignSelf: "flex-start",
  gap: 4,
  maxWidth: "60%",
},

assigneeAvatar: {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#fff",
},

assigneeIcon: {
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: "rgba(255,255,255,0.2)",
  justifyContent: "center",
  alignItems: "center",
},

assigneeIconText: {
  fontSize: 10,
  color: "#fff",
},

assigneeText: {
  fontSize: 11,
  color: "#fff",
  fontWeight: "600",
  flex: 1,
},

  taskTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginVertical: 8,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskDate: { fontSize: 13, color: "#999" },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  statusDone: { backgroundColor: "#4CAF50" },
  statusProgress: { backgroundColor: "#FFA726" },
  statusTodo: { backgroundColor: "#ff0000ff" },
  statusBacklog: { backgroundColor: "#9E9E9E" },

  addButton: {
    position: "absolute",
    bottom: 100,
    right: 25,
    backgroundColor: "#7b2ff7",
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderColor: "#ddd",
  },
  linkButton: {
    fontSize: 16,
    color: "#7b2ff7",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  // ---------- MODAL STYLES ----------
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

settingsModal: {
  backgroundColor: "#fff",
  borderRadius: 25,
  padding: 0,
  width: "85%",
  maxWidth: 400,
  alignItems: "center",
  position: "relative",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 20,
  elevation: 15,
  overflow: "hidden",
},

settingsHeader: {
  backgroundColor: "#7b2ff7",
  width: "100%",
  paddingVertical: 20,
  alignItems: "center",
  justifyContent: "center",
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
},

settingsTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#fff",
  textAlign: "center",
  letterSpacing: 0.5,
},

settingsOptions: {
  width: "100%",
  paddingHorizontal: 20,
  paddingVertical: 20,
},

settingsButton: {
  backgroundColor: "#f8f9ff",
  borderRadius: 15,
  marginBottom: 15,
  padding: 0,
  shadowColor: "#7b2ff7",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
  borderWidth: 1,
  borderColor: "#e8e2ff",
},

logoutButton: {
  backgroundColor: "#ff4757",
  borderColor: "#ff4757",
  shadowColor: "#ff4757",
},


buttonContent: {
  flexDirection: "row",
  alignItems: "center",
  padding: 18,
},

buttonIcon: {
  fontSize: 24,
  marginRight: 15,
},

buttonTextContainer: {
  flex: 1,
},

settingsButtonText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#333",
  marginBottom: 4,
},

settingsButtonSubtext: {
  fontSize: 13,
  color: "#666",
  lineHeight: 18,
},

arrowIcon: {
  fontSize: 20,
  color: "#7b2ff7",
  fontWeight: "bold",
  marginLeft: 10,
},

userInfoModal: {
  backgroundColor: "#fff",
  borderRadius: 25,
  padding: 0,
  width: "90%",
  maxWidth: 400,
  alignItems: "center",
  position: "relative",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 20,
  elevation: 15,
  overflow: "hidden",
},

modalHeader: {
  backgroundColor: "#7b2ff7",
  width: "100%",
  paddingVertical: 20,
  alignItems: "center",
  justifyContent: "center",
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
},

userInfoTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#fff",
  textAlign: "center",
  letterSpacing: 0.5,
},

userInfoContainer: {
  paddingHorizontal: 20,
  paddingVertical: 10,
},

userInfoText: {
  fontSize: 16,
  color: "#333",
  marginBottom: 12,
  lineHeight: 24,
  backgroundColor: "#f8f9ff",
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderRadius: 12,
  borderLeftWidth: 4,
  borderLeftColor: "#7b2ff7",
  fontWeight: "500",
},

// Edit form styles
editForm: {
  width: "100%",
  marginTop: 20,
  paddingHorizontal: 20,
  paddingBottom: 20,
},

editInput: {
  borderWidth: 2,
  borderColor: "#e8e2ff",
  borderRadius: 15,
  padding: 15,
  marginBottom: 15,
  fontSize: 16,
  backgroundColor: "#f8f9ff",
  color: "#333",
  fontWeight: "500",
  shadowColor: "#7b2ff7",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},

editButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
  gap: 12,
},

editButton: {
  flex: 1,
  paddingVertical: 15,
  borderRadius: 15,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4,
},

cancelButton: {
  backgroundColor: "#fff",
  borderWidth: 2,
  borderColor: "#e8e2ff",
},

saveButton: {
  backgroundColor: "#7b2ff7",
  borderWidth: 2,
  borderColor: "#7b2ff7",
},

cancelButtonText: {
  color: "#7b2ff7",
  fontWeight: "700",
  fontSize: 16,
},

saveButtonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},

// Action buttons styles
actionButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 25,
  marginBottom: 20,
  paddingHorizontal: 20,
  gap: 15,
},

actionButton: {
  flex: 1,
  paddingVertical: 15,
  borderRadius: 15,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 6,
},

editActionButton: {
  backgroundColor: "#7b2ff7",
  borderWidth: 2,
  borderColor: "#7b2ff7",
},

deleteActionButton: {
  backgroundColor: "#ff4757",
  borderWidth: 2,
  borderColor: "#ff4757",
},

editActionButtonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
  letterSpacing: 0.5,
},

deleteActionButtonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
  letterSpacing: 0.5,
},

// Avatar picker styles
avatarLabel: {
  fontSize: 16,
  fontWeight: "600",
  color: "#7b2ff7",
  marginTop: 15,
  marginBottom: 10,
},

avatarSelector: {
  width: 80,
  height: 80,
  borderRadius: 40,
  borderWidth: 2,
  borderColor: "#e8e2ff",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 15,
  alignSelf: "center",
},

avatarPreview: {
  width: 76,
  height: 76,
  borderRadius: 38,
},

avatarPlaceholder: {
  width: 76,
  height: 76,
  borderRadius: 38,
  backgroundColor: "#f8f9ff",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#e8e2ff",
  borderStyle: "dashed",
},

avatarPlaceholderText: {
  fontSize: 12,
  color: "#7b2ff7",
  fontWeight: "600",
  textAlign: "center",
},

// Avatar picker modal styles
avatarPickerModal: {
  backgroundColor: "#fff",
  borderRadius: 25,
  padding: 0,
  width: "85%",
  maxWidth: 400,
  alignItems: "center",
  position: "relative",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 20,
  elevation: 15,
  overflow: "hidden",
},

avatarPickerHeader: {
  backgroundColor: "#7b2ff7",
  width: "100%",
  paddingVertical: 20,
  alignItems: "center",
  justifyContent: "center",
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  position: "relative",
},

avatarPickerTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#fff",
  textAlign: "center",
  letterSpacing: 0.5,
},

avatarPickerClose: {
  position: "absolute",
  top: 15,
  right: 20,
  backgroundColor: "#f8f9ff",
  borderRadius: 20,
  width: 35,
  height: 35,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#7b2ff7",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

avatarPickerCloseText: {
  fontSize: 18,
  color: "#7b2ff7",
  fontWeight: "bold",
},

avatarPickerGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  padding: 20,
  gap: 15,
},

avatarPickerOption: {
  width: 70,
  height: 70,
  borderRadius: 35,
  borderWidth: 2,
  borderColor: "#e8e2ff",
  padding: 2,
},

avatarPickerSelected: {
  borderColor: "#7b2ff7",
  borderWidth: 3,
},

avatarPickerImage: {
  width: "100%",
  height: "100%",
  borderRadius: 33,
},

// Password change modal styles
passwordModal: {
  backgroundColor: "#fff",
  borderRadius: 25,
  padding: 0,
  width: "85%",
  maxWidth: 400,
  alignItems: "center",
  position: "relative",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 20,
  elevation: 15,
  overflow: "hidden",
},

passwordHeader: {
  backgroundColor: "#4CAF50",
  width: "100%",
  paddingVertical: 20,
  alignItems: "center",
  justifyContent: "center",
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  position: "relative",
},

passwordTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#fff",
  textAlign: "center",
  letterSpacing: 0.5,
},

passwordClose: {
  position: "absolute",
  top: 15,
  right: 20,
  backgroundColor: "#f8f9ff",
  borderRadius: 20,
  width: 35,
  height: 35,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#4CAF50",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

passwordCloseText: {
  fontSize: 18,
  color: "#4CAF50",
  fontWeight: "bold",
},

passwordForm: {
  width: "100%",
  padding: 20,
},

passwordInput: {
  borderWidth: 2,
  borderColor: "#e8e2ff",
  borderRadius: 15,
  padding: 15,
  marginBottom: 15,
  fontSize: 16,
  backgroundColor: "#f8f9ff",
  color: "#333",
  fontWeight: "500",
  shadowColor: "#4CAF50",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},

passwordButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
  gap: 12,
},

passwordButton: {
  flex: 1,
  paddingVertical: 15,
  borderRadius: 15,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4,
},

passwordCancelButton: {
  backgroundColor: "#fff",
  borderWidth: 2,
  borderColor: "#e8e2ff",
},

passwordSaveButton: {
  backgroundColor: "#4CAF50",
  borderWidth: 2,
  borderColor: "#4CAF50",
},

passwordCancelButtonText: {
  color: "#4CAF50",
  fontWeight: "700",
  fontSize: 16,
},

passwordSaveButtonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},
closeIconContainer: {
  position: "absolute",
  top: 15,
  right: 20,
  zIndex: 1,
  backgroundColor: "#f8f9ff",
  borderRadius: 20,
  width: 35,
  height: 35,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#7b2ff7",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

closeIcon: {
  fontSize: 18,
  color: "#7b2ff7",
  fontWeight: "bold",
},


});

export default HomeScreen;
