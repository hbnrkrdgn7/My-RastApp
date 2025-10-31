import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TaskDetail from "./TaskDetail"; 

// Alt bar component'i
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
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [page, setPage] = useState(1);      
  const [limit] = useState(10);           
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); 

  // Component açıldığında kullanıcı id ve görevleri çek
  useEffect(() => {
    const fetchUserIdAndTasks = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        setUserId(parsed.id);
        fetchTasks(parsed.id, 1);  // ilk sayfa görevleri al
      }
    };
    fetchUserIdAndTasks();
  }, []);

  // Görevleri backend'den çek ve sayfalama yap
  const fetchTasks = async (id, nextPage = 1) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await axios.get(`http://192.168.0.248:5000/api/tasks/user/${id}`);
      const allTasks = res.data || [];

      const startIndex = (nextPage - 1) * limit;
      const endIndex = startIndex + limit;
      const newTasks = allTasks.slice(startIndex, endIndex);

      if (nextPage === 1) {
        setTasks(newTasks);
      } else {
        setTasks(prev => [...prev, ...newTasks]);
      }

      setHasMore(endIndex < allTasks.length);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
      Alert.alert("Hata", "Görevler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) fetchTasks(userId, page + 1);
  };

  // Her görev için render fonksiyonu
  const renderTask = ({ item }) => {
    // durum stilini belirle
    const statusStyle =
      item.status === "Done" ? styles.statusDone :
      item.status === "In Progress" ? styles.statusProgress :
      item.status === "Backlog" ? styles.statusBacklog :
      styles.statusTodo;

    // Atanmış kullanıcı bilgilerini al
    const taskWithAssignee = {
      ...item,
      assigned_to_name:
        item.assigned_to_name ||
        (item.users_tasks_assignee_idTousers
          ? `${item.users_tasks_assignee_idTousers.name} ${item.users_tasks_assignee_idTousers.surname}`
          : "Unassigned"),
      assigned_to_avatar:
        item.assigned_to_avatar ||
        item.users_tasks_assignee_idTousers?.profile_picture ||
        null,
    };

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => {
          const fixedTask = {
            ...item,
            assigned_to_name:
              item.users_tasks_assignee_idTousers
                ? `${item.users_tasks_assignee_idTousers.name} ${item.users_tasks_assignee_idTousers.surname}`
                : "Unassigned",
            assigned_to_avatar:
              item.users_tasks_assignee_idTousers?.profile_picture || null,
          };

          setSelectedTask(fixedTask); 
          setModalVisible(true);    
        }}
      >
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

        {/* tarih ve durum */}
        <View style={styles.taskFooter}>
          <Text style={styles.taskDate}>
            📅 {new Date(item.created_at).toLocaleDateString("tr-TR")}
          </Text>
          <Text style={[styles.statusBadge, statusStyle]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Başlık ve görev sayısı */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Tasks</Text>
        <Text style={styles.taskCount}>{tasks.length}</Text>
      </View>

      {/* Görev listesi */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={{
                margin: 15,
                padding: 12,
                backgroundColor: "#7b2ff7",
                borderRadius: 10,
                alignItems: "center"
              }}
              onPress={() => fetchTasks(userId, page + 1)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {loading ? "Yükleniyor..." : "Daha Fazla Göster"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Görev detay modalı */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setModalVisible(false)}
            refresh={() => { fetchTasks(userId); }} 
          />
        )}
      </Modal>

      {/* Alt bar */}
      <BottomBar navigation={navigation} />
    </View>
  );
};

export default MyTasksScreen;

// Styles kodları
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },
  header: { fontSize: 22, fontWeight: "700", margin: 15 },
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
  bottomLinkText: { color: "#7b2ff7", fontWeight: "600", fontSize: 15 },
  headerContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  margin: 15,
  marginBottom: 5,
},
taskCount: {
  marginLeft: 8,
  fontSize: 18,
  color: "#999", 
  fontWeight: "600",
},

});