import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://172.2.1.41:5000/api"; // Backend URL

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

const UserInfoScreen = ({ navigation, route }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", surname: "", email: "", profile_picture: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // ✅ AsyncStorage'dan giriş yapan kullanıcıyı al
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı.");
        navigation.goBack();
        return;
      }
      const user = JSON.parse(userData);

      // Backend’den detaylı kullanıcı bilgilerini çek
      const res = await axios.get(`${API_URL}/users/userinfo/${user.id}`);
      setUserInfo(res.data);
      setEditForm({
        name: res.data.name,
        surname: res.data.surname,
        email: res.data.email,
        profile_picture: res.data.profile_picture || ""
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Hata", err.message || "Kullanıcı bilgileri alınamadı.");
    }
  };

  const handleSave = async () => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    const res = await axios.put(`${API_URL}/users/userinfo/${user.id}`, editForm);

    setUserInfo(res.data);
    setIsEditing(false);

    // Güncellenen kullanıcıyı AsyncStorage’a kaydet
    await AsyncStorage.setItem("user", JSON.stringify(res.data));

    // ✅ HomeScreen’e güncellenen kullanıcıyı gönder
    navigation.navigate("Home", { updatedUser: res.data });

    Alert.alert("Başarılı", "Bilgiler güncellendi!");
  } catch (err) {
    console.error(err);
    Alert.alert("Hata", err.response?.data?.error || "Bilgiler güncellenemedi.");
  }
};

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Emin misiniz?",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" }, 
        {text:"Evet, Sil",
          style:"destructive",
          onPress: async () => {
            try {
              const userData = await AsyncStorage.getItem("user");
              if (!userData) return;
              const user = JSON.parse(userData);
              console.log("Kullanıcı verisi:", user);
              console.log("Silinecek kullanıcı ID:", user.id);
              await axios.delete(`${API_URL}/users/userinfo/${user.id}`);
              await AsyncStorage.removeItem("user");
              Alert.alert("Hesabınız silindi.");
              navigation.navigate("Login");
            } catch (err) {
              console.error(err);
              Alert.alert("Hata", err.response?.data?.error || "Hesap silinemedi.");
            }
          },
        },
      ]
    );
  };
  if (!userInfo) return <Text style={{ marginTop: 50, textAlign: "center" }}>Yükleniyor...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Başlık */}
      <Text style={styles.title}>
        {isEditing ? "Edit User Information" : "User Information"}
      </Text>

      {/* Avatar */}
      <Image
        source={{ uri: editForm.profile_picture || "https://via.placeholder.com/100" }}
        style={styles.avatar}
      />

      {/* Düzenleme modunda avatar seçimi */}
      {isEditing && (
        <View style={styles.avatarGrid}>
          {avatarOptions.map((avatar, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.avatarOption, editForm.profile_picture === avatar && styles.selectedAvatar]}
              onPress={() => setEditForm(prev => ({ ...prev, profile_picture: avatar }))}
            >
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Form Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Ad"
        value={editForm.name}
        editable={isEditing}
        onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Soyad"
        value={editForm.surname}
        editable={isEditing}
        onChangeText={(text) => setEditForm(prev => ({ ...prev, surname: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={editForm.email}
        editable={isEditing}
        keyboardType="email-address"
        onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
      />

      {/* Düzenle / Kaydet Butonları */}
{isEditing ? (
  <TouchableOpacity style={styles.button} onPress={handleSave}>
    <Text style={styles.buttonText}>Save</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
    <Text style={styles.buttonText}>Edit</Text>
  </TouchableOpacity>
)}

{/* Geri / İptal Butonu */}
<TouchableOpacity
  style={[styles.button, { backgroundColor: "#ccc" }]}
  onPress={() => {
    if (isEditing) {
      setIsEditing(false);
      navigation.navigate("UserInfo");
    } else {
      navigation.goBack();
    }
  }}
>
  <Text style={[styles.buttonText, { color: "#333" }]}>
    {isEditing ? "Cancel" : "Back"}
  </Text>
</TouchableOpacity>

{/* Hesabı Sil Butonu, sadece düzenleme modunda ve en altta */}
{isEditing && (
  <View style={styles.deleteButtonContainer}>
    <TouchableOpacity
      style={[styles.button, { backgroundColor: "#ff4d4d" }]}
      onPress={handleDeleteAccount}
    >
      <Text style={styles.buttonText}>Delete Account</Text>
    </TouchableOpacity>
  </View>
)}
    </ScrollView>
  );
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: "#fff", 
    alignItems: "center", 
    justifyContent:"center" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#7b2ff7", 
    textAlign: "center" 
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 20 
  },
  input: { 
    width: "100%", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 15 
  },
  button: { 
    backgroundColor: "#7b2ff7", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    width: "100%", 
    marginBottom: 10 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 15,
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
  deleteButtonContainer: {
  position: "absolute",
  bottom: 20,
  left: 20,
  right: 20,
},

});
