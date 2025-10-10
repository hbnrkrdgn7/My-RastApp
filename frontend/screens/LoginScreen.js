/**
 * LoginScreen.js
 * 
 * Kullanıcı girişi ve kayıt işlemlerini yöneten ana ekran
 * - Kullanıcı girişi (email/password)
 * - Yeni kullanıcı kaydı (8 farklı avatar seçeneği ile)
 * - Şifre validasyonu (minimum 6 karakter)
 * - AsyncStorage ile kullanıcı verisi saklama
 */

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Image, ScrollView} from "react-native";
import { loginUser, registerUser } from "../services/api"; // Backend API çağrıları
import AsyncStorage from "@react-native-async-storage/async-storage"; // Yerel veri saklama

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerVisible, setRegisterVisible] = useState(false);
  const [regName, setRegName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  /**
   * Profil fotoğrafı seçenekleri
   * Flaticon'dan alınan 8 farklı avatar seçeneği
   * Kayıt sırasında kullanıcı bu avatarlardan birini seçebilir
   */
  const avatarOptions = [
    "https://cdn-icons-png.flaticon.com/512/219/219983.png", // Erkek avatar
    "https://cdn-icons-png.flaticon.com/512/219/219970.png", // Kadın avatar
    "https://cdn-icons-png.flaticon.com/512/219/219968.png", // Erkek avatar 2
    "https://cdn-icons-png.flaticon.com/512/219/219964.png", // Kadın avatar 2
    "https://cdn-icons-png.flaticon.com/512/219/219960.png", // Erkek avatar 3
    "https://cdn-icons-png.flaticon.com/512/219/219956.png", // Kadın avatar 3
    "https://cdn-icons-png.flaticon.com/512/219/219971.png", // Kadın avatar 4
    "https://cdn-icons-png.flaticon.com/512/219/219974.png", // Kadın avatar 5
  ];

  /**
   * Kullanıcı giriş işlemi
   * - Email ve şifre ile backend'e giriş isteği
   * - Başarılı girişte kullanıcı verisini AsyncStorage'a kaydet
   * - HomeScreen'e yönlendir
   */
  const handleLogin = async () => {
    console.log("Giriş butonuna basıldı ✅");
    try {
      const res = await loginUser({ email, password });
      if (res.user) {
        console.log("Giriş başarılı, Home'a yönlendiriliyor...");

        // ✅ Kullanıcı ID'sini local'e kaydet
        await AsyncStorage.setItem("userId", res.user.id.toString());

        // ✅ Kullanıcı verisini de saklayabiliriz (isteğe bağlı)
        await AsyncStorage.setItem("userData", JSON.stringify(res.user));

        navigation.replace("Home", { user: res.user });
      } else {
        console.log("Yanıt geldi ama user yok:", res);
      }
    } catch (err) {
      console.log("Giriş hatası:", err);
      Alert.alert("Giriş Başarısız", "E-posta veya şifre hatalı.");
    }
  };


  const handleRegister = async () => {
  console.log("Kayıt butonuna basıldı ✅");

  if (!regName || !regLastName || !regEmail || !regPassword) {
    Alert.alert("Uyarı", "Tüm alanları doldurmanız gerekiyor!");
    return;
  }

  if (regPassword.length < 6) {
    Alert.alert("Uyarı", "Şifre en az 6 karakter olmalıdır!");
    return;
  }

  if (!selectedAvatar) {
    Alert.alert("Uyarı", "Lütfen bir profil fotoğrafı seçin!");
    return;
  }

  try {
    const res = await registerUser({
      name: regName,
      surname: regLastName,
      email: regEmail,
      password: regPassword,
      profile_picture: selectedAvatar,
    });

    console.log("Kayıt başarılı:", res);
    Alert.alert("Başarılı", "Kayıt başarılı! Giriş yapabilirsiniz.");

    setRegisterVisible(false);
    setRegName("");
    setRegLastName("");
    setRegEmail("");
    setRegPassword("");
    setSelectedAvatar(null);
  } catch (err) {
    console.log("Kayıt hatası:", err);
    Alert.alert("Hata", "Kayıt işlemi başarısız oldu!");
  }
};


  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/rast-mobile-logo.png")} // ✅ Logonun yolu
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Hoş Geldiniz 👋</Text>
      <Text style={styles.subtitle}>Hesabınıza giriş yap</Text>

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Giriş Yap</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Hesabın yok mu?{" "}
        <Text
          style={styles.registerLink}
          onPress={() => setRegisterVisible(true)}
        >
          Hesap oluştur
        </Text>
      </Text>

      {/* 🔹 Kayıt Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={registerVisible}
        onRequestClose={() => setRegisterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Hesap Oluştur</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Ad"
                value={regName}
                onChangeText={setRegName}
              />
              <TextInput
                style={styles.input}
                placeholder="Soyisim"
                value={regLastName}
                onChangeText={setRegLastName}
              />

              <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            <TextInput
              style={styles.input}
              placeholder="Şifre (En az 6 karakter)"
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
            />

              {/* Profil Fotoğrafı Seçimi */}
              <Text style={styles.avatarLabel}>👤 Profil Fotoğrafı Seçin</Text>
              <View style={styles.avatarGrid}>
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.avatarOption,
                      selectedAvatar === avatar && styles.selectedAvatar
                    ]}
                    onPress={() => setSelectedAvatar(avatar)}
                  >
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                <Text style={styles.registerBtnText}>Kayıt Ol</Text>
              </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setRegisterVisible(false);
                setRegName("");
                setRegLastName("");
                setRegEmail("");
                setRegPassword("");
                setSelectedAvatar(null);
              }}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: -40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7b2ff7",
    marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 30 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#7b2ff7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registerText: { marginTop: 20, color: "#333" },
  registerLink: { color: "#7b2ff7", fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  
  avatarLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7b2ff7",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#e8e2ff",
    padding: 2,
  },
  selectedAvatar: {
    borderColor: "#7b2ff7",
    borderWidth: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },
  
  registerBtn: {
    backgroundColor: "#7b2ff7",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
  },
  registerBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
  
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e8e2ff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: { 
    color: "#7b2ff7", 
    fontWeight: "700", 
    fontSize: 16 
  },
});
