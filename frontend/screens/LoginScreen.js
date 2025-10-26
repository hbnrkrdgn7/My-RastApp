import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👈 Eklendi
import { loginUser, registerUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerVisible, setRegisterVisible] = useState(false);
  const [regName, setRegName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

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

  // 🔹 Ortak sıfırlama fonksiyonu
  const resetRegisterForm = () => {
    setRegisterVisible(false);
    setRegName("");
    setRegLastName("");
    setRegEmail("");
    setRegPassword("");
    setSelectedAvatar(null);
  };

const handleLogin = async () => {
  try {
    const res = await loginUser({ email, password });

    if (res?.user) {
      await AsyncStorage.setItem("user", JSON.stringify(res.user));
      navigation.replace("Home");
    }
  } catch (err) {
    console.log("Giriş hatası:", err);

    // Axios hatasını yakala
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


 const handleRegister = async () => {
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

  if (res?.user) {
    Alert.alert("Başarılı", "Kayıt başarılı! Giriş yapabilirsiniz.");
    setRegisterVisible(false);
    setRegName(""); setRegLastName(""); setRegEmail(""); setRegPassword(""); setSelectedAvatar(null);
    return;
  }
} catch (err) {
  console.log("Kayıt hatası detay:", err.response);
  const message = err.response?.data?.error || "Kayıt işlemi başarısız oldu!";
  Alert.alert("Uyarı", message);
}

 };
 
  return (
    <View style={styles.container}>
      <Image source={require("../assets/rast-mobile-logo.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Login to Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Don't you have an account?{" "}
        <Text style={styles.registerLink} onPress={() => setRegisterVisible(true)}>
          Create an account
        </Text>
      </Text>

      {/* 🔹 Kayıt Modalı */}
      <Modal animationType="slide" transparent={true} visible={registerVisible} onRequestClose={() => setRegisterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create an account</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
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
              <TextInput
                style={styles.input}
                placeholder="Password (At least 6 characters)"
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
              />

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
