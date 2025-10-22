import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔹 Alt bar component
const BottomBar = ({ navigation }) => (
  <View style={styles.bottomBar}>
    <TouchableOpacity onPress={() => navigation.navigate("Home")}>
      <Ionicons name="home-outline" size={26} color="#7b2ff7" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate("Home")}>
      <Text style={styles.bottomLinkText}>Go to Word Ninja</Text>
    </TouchableOpacity>
  </View>
);

const MyTasksScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
 

  // 🔹 AsyncStorage’den kullanıcı ID'sini al
 useEffect(() => {
  const fetchUserIdAndTasks = async () => {
    const user = await AsyncStorage.getItem("user");
    console.log("AsyncStorage user:", user);
    if (user) {
      const parsed = JSON.parse(user);
      console.log("Parsed user:", parsed);
      setUserId(parsed.id);
      fetchTasks(parsed.id); // ✅ userId gelince görevleri çek
    }
  };
  fetchUserIdAndTasks();
}, []);

// 🔹 Backend’den görevleri çek
const fetchTasks = async (id) => {
  try {
    const res = await axios.get(`http://192.168.0.248:5000/api/tasks/user/${id}`);
    console.log("Fetched tasks:", res.data);
    setTasks(res.data);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    Alert.alert("Hata", "Görevler yüklenemedi.");
  }
};

  // 🔹 Her bir görevi render et
  const renderTask = ({ item }) => {
    const statusStyle =
      item.status === "Done" ? styles.statusDone :
      item.status === "In Progress" ? styles.statusProgress :
      item.status === "Backlog" ? styles.statusBacklog :
      styles.statusTodo;

    return (
      <View style={styles.taskCard}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={3}>
          {item.description || "No description"}
        </Text>

        {item.assigned_to_name && (
          <View style={styles.assigneeTag}>
            {item.assigned_to_avatar ? (
              <Image source={{ uri: item.assigned_to_avatar }} style={styles.assigneeAvatar} />
            ) : (
              <View style={styles.assigneeIcon}><Text style={styles.assigneeIconText}>👤</Text></View>
            )}
            <Text style={styles.assigneeText} numberOfLines={1}>{item.assigned_to_name}</Text>
          </View>
        )}
            
        <View style={styles.taskFooter}>
          <Text style={styles.taskDate}>
            📅 {new Date(item.created_at).toLocaleDateString("tr-TR")}
          </Text>
          <Text style={[styles.statusBadge, statusStyle]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.taskCard, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.header}>My Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 150 }}
      />

      <BottomBar navigation={navigation} />
    </View>
  );
};

export default MyTasksScreen;

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { 
   flex: 1, 
   backgroundColor: "#F9F9FB" 
},
  header: { 
   fontSize: 22, 
   fontWeight: "700", 
   margin: 15 
},
  taskCard: {
    backgroundColor: "#fff",
    marginVertical: 5,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  taskTitle: { 
   fontWeight: "700", 
   fontSize: 16 
},
  taskDescription: { 
   fontSize: 14, 
   color: "#333", 
   marginTop: 5 
},
  assigneeTag: { 
   flexDirection: "row", 
   alignItems: "center",
   marginTop: 8 
},
  assigneeAvatar: {
   width: 30, 
   height: 30, 
   borderRadius: 15 
},
  assigneeIcon: {
   width: 30, 
   height: 30, 
   borderRadius: 15, 
   backgroundColor: "#eee", 
   justifyContent: "center", 
   alignItems: "center" 
},
  assigneeIconText: { 
    fontSize: 16 
  },
  assigneeText: { 
    marginLeft: 6,
    fontSize: 14, 
    maxWidth: 150 
  },
  taskFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 8 
  },
  taskDate: { 
    fontSize: 12, 
    color: "#888" 
  },
  statusBadge: { 
    fontSize: 12, 
    fontWeight: "700", 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 8, 
    color: "#fff" 
  },
  statusDone: { 
    backgroundColor: "#4BB543" 
  },
  statusProgress: { 
    backgroundColor: "#FFA500" 
  },
  statusBacklog: { 
    backgroundColor: "#FF6347" 
  },
  statusTodo: { 
    backgroundColor: "#7b2ff7" 

  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  bottomLinkText: { 
    color: "#7b2ff7", 
    fontWeight: "600", 
    fontSize: 15 },
});
