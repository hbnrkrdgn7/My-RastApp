import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const ChangePasswordScreen = ({ navigation }) => {
  // State'ler
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Şifre değiştirme fonksiyonu
  const handleChangePassword = async () => {
    // Boş alan kontrolü
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Hata", "Tüm alanları doldurun.");
      return;
    }

    // Yeni şifre ve onay şifresi eşleşiyor mu
    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Yeni şifre ve onay şifresi eşleşmiyor.");
      return;
    }

    // Minimum uzunluk
    if (newPassword.length < 6) {
      Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    // Güçlü şifre kontrolü
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Hata",
        "Yeni şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir."
      );
      return;
    }

    try {
      // Kullanıcı bilgilerini AsyncStorage’dan al
      const storedUserJson = await AsyncStorage.getItem("user");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (!storedUserJson && !storedUserId) {
        Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        navigation.replace("Login");
        return;
      }

      const user = storedUserJson ? JSON.parse(storedUserJson) : { id: Number(storedUserId) };
      const userId = user?.id ?? user?._id ?? Number(storedUserId);

      if (!userId) {
        Alert.alert("Hata", "Kullanıcı ID bulunamadı. Lütfen tekrar giriş yapın.");
        navigation.replace("Login");
        return;
      }

      // Backend isteği
      await axios.put(`http://192.168.0.248:5000/api/users/changepassword/${userId}`, {
        currentPassword,
        newPassword
      });

      Alert.alert(
        "Başarılı",
        "Şifreniz başarıyla değiştirildi.",
        [{ text: "Tamam", onPress: () => navigation.replace("Login") }]
      );

      // State temizle
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log("Şifre değiştirme hatası detay:", err.response?.data ?? err.message ?? err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      Alert.alert("Hata", serverMsg || "Şifre değiştirilemedi.");
    }
  };
  const renderPasswordInput = (value, setValue, showPassword, setShowPassword, placeholder) => (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.inputPassword}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
        <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#777" />
      </TouchableOpacity>
    </View>
  );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      {renderPasswordInput(currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword, "Current Password")}
      {renderPasswordInput(newPassword, setNewPassword, showNewPassword, setShowNewPassword, "New Password")}
      {renderPasswordInput(confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, "Confirm New Password")}

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, { color: "#333" }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;

// Styles kodları 
const styles = StyleSheet.create({
  container: { 
   flex: 1, 
   padding: 20, 
   justifyContent: "center", 
   backgroundColor: "#fff" 
},
  title: { 
   fontSize: 24, 
   fontWeight: "bold", 
   color: "#7b2ff7", 
   marginBottom: 20, 
   textAlign: "center" 
},
  input: { 
   width: "100%", 
   borderWidth: 1, 
   borderColor: "#ccc", 
   borderRadius: 8, 
   padding: 12, 
   marginBottom: 15 
},
  button: { 
   backgroundColor: "#7b2ff7", 
   padding: 15,
   borderRadius: 10, 
   alignItems: "center", 
   marginBottom: 10 
},
  buttonText: { 
   color: "#fff", 
   fontWeight: "bold", 
   fontSize: 16 
},
  cancel: { 
   backgroundColor: "#ccc" 
},
inputPassword: {
  flex: 1,
  padding: 12,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  paddingRight: 40,
  fontSize: 14,
  marginBottom: 15,
},
passwordContainer: { 
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
  marginBottom: 15,
},
eyeIcon: { 
  position: "absolute",
  right: 10,
},
});
