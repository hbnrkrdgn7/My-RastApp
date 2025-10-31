import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { loginUser, registerUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  // Giriş formu state'leri
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Kayıt modalı ve form state'leri
  const [registerVisible, setRegisterVisible] = useState(false);
  const [regName, setRegName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  // Profil avatar seçenekleri
  const avatarOptions = [
    "https://cdn-icons-png.flaticon.com/512/219/219983.png",
    "https://cdn-icons-png.flaticon.com/512/219/219970.png",
    "https://cdn-icons-png.flaticon.com/512/219/219968.png",
    "https://cdn-icons-png.flaticon.com/512/219/219964.png",
    "https://cdn-icons-png.flaticon.com/512/219/219960.png",
    "https://cdn-icons-png.flaticon.com/512/219/219956.png",
    "https://cdn-icons-png.flaticon.com/512/219/219971.png",
    "https://cdn-icons-png.flaticon.com/512/219/219974.png",
  ];

  // Kayıt formunu temizleme ve modalı kapatma
  const resetRegisterForm = () => {
    setRegisterVisible(false);
    setRegName("");
    setRegLastName("");
    setRegEmail("");
    setRegPassword("");
    setSelectedAvatar(null);
  };

  // Helper: e-posta formatı kontrolü
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Giriş işlemi
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Uyarı", "E-posta ve şifre alanları boş bırakılamaz!");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Uyarı", "Geçerli bir e-posta girin!");
      return;
    }

    try {
      const res = await loginUser({ email, password });

      if (res?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(res.user));
        navigation.replace("Home"); 
      }
    } catch (err) {
      console.log("Giriş hatası:", err);

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.error;

        if (status === 404 && message === "User not found") {
          Alert.alert("Hata", "Bu e-posta adresine ait bir hesap bulunamadı!");
        } else if (status === 401) {
          Alert.alert("Hata", "E-posta veya şifre hatalı!");
        } else {
          Alert.alert("Hata", message || "Giriş işlemi başarısız oldu!");
        }
      } else {
        Alert.alert("Hata", "Giriş işlemi başarısız oldu!");
      }
    }
  };

  // Kayıt işlemi
  const handleRegister = async () => {
    // Boş alan kontrolü
    if (!regName || !regLastName || !regEmail || !regPassword) {
      Alert.alert("Uyarı", "Tüm alanları doldurmanız gerekiyor!");
      return;
    }

    // E-posta formatı kontrolü
    if (!isValidEmail(regEmail)) {
      Alert.alert("Uyarı", "Geçerli bir e-posta girin!");
      return;
    }

    // Şifre minimum uzunluk
    if (regPassword.length < 6) {
      Alert.alert("Uyarı", "Şifre en az 6 karakter olmalıdır!");
      return;
    }

    // Şifre güçlü mü kontrol et 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(regPassword)) {
       Alert.alert( "Uyarı", "Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir." );
      return;
    }

    // Profil fotoğrafı seçildi mi
    if (!selectedAvatar) {
      Alert.alert("Uyarı", "Lütfen bir profil fotoğrafı seçin!");
      return;
    }

    // Backend isteği
    try {
      const res = await registerUser({
        name: regName,
        surname: regLastName,
        email: regEmail,
        password: regPassword,
        profile_picture: selectedAvatar,
      });

      if (res?.user) {
        Alert.alert("Başarılı", "Kayıt başarılı! Giriş yapabilirsiniz.");
        resetRegisterForm();
      }
    } catch (err) {
      console.log("Kayıt hatası detay:", err);
        const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
      "Kayıt işlemi başarısız oldu!";
    Alert.alert("Hata", serverMsg);
  }
};

  return (
    <View style={styles.container}>
      {/* Logo ve başlık */}
      <Image source={require("../assets/rast-mobile-logo.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Login to Your Account</Text>

      {/* Giriş formu */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.inputPassword}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
      <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#777" />
      </TouchableOpacity>
    </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Don't you have an account?{" "}
        <Text style={styles.registerLink} onPress={() => setRegisterVisible(true)}>
          Create an account
        </Text>
      </Text>

      {/* Kayıt Modalı */}
      <Modal animationType="slide" transparent={true} visible={registerVisible} onRequestClose={() => setRegisterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create an account</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Kayıt formu inputları */}
              <TextInput style={styles.input} placeholder="Name" value={regName} onChangeText={setRegName} />
              <TextInput style={styles.input} placeholder="Surname" value={regLastName} onChangeText={setRegLastName} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Password (At least 6 characters)"
            value={regPassword}
            onChangeText={setRegPassword}
            secureTextEntry={!showRegPassword}
          />
          <TouchableOpacity onPress={() => setShowRegPassword(prev => !prev)} style={styles.eyeIcon}>
            <Ionicons name={showRegPassword ? "eye" : "eye-off"} size={22} color="#777" />
          </TouchableOpacity>
        </View>

              {/* Profil Fotoğrafı Seçimi */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Ionicons name="person-circle-outline" size={24} color="#7b2ff7" />
                <Text style={styles.avatarLabel}>Choose a profile photo</Text>
              </View>

              <View style={styles.avatarGrid}>
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.avatarOption, selectedAvatar === avatar && styles.selectedAvatar]}
                    onPress={() => setSelectedAvatar(avatar)}
                  >
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  </TouchableOpacity>
                ))}
              </View>
              

              {/* Kayıt ve iptal butonları */}
              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                <Text style={styles.registerBtnText}>Sign up</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={resetRegisterForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;

// Styles kodları
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
  subtitle: { 
    fontSize: 16, 
    color: "#555", 
    marginBottom: 30 
  },
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
  loginText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  registerText: { 
    marginTop: 20, 
    color: "#333"
  },
  registerLink: { 
    color: "#7b2ff7", 
    fontWeight: "bold" 
  },

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
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  
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
  registerBtnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16, 
    textAlign: "center" },
  
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
  passwordContainer: {
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
  marginBottom: 15,
},
inputPassword: {
  flex: 1,
  padding: 12,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  paddingRight: 40, 
  fontSize: 14,
},
eyeIcon: {
  position: "absolute",
  right: 10,
},

});
