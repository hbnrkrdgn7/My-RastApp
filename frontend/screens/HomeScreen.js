import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Image, Linking
} from "react-native";
import { getTasks } from "../services/api";
import AddTaskModal from "./AddTaskModal";
import TaskDetail from "./TaskDetail";
import Ionicons from "react-native-vector-icons/Ionicons";
import SettingsModal from "./SettingsModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const statuses = ["Backlog", "Todo", "In Progress", "Done"];
  const projectId = 1;

  // Durumlara göre state'ler
  const [tasksByStatus, setTasksByStatus] = useState({
    Backlog: [], Todo: [], "In Progress": [], Done: []
  });
  const [pageByStatus, setPageByStatus] = useState({
    Backlog: 1, Todo: 1, "In Progress": 1, Done: 1
  });
  const [loadingByStatus, setLoadingByStatus] = useState({
    Backlog: false, Todo: false, "In Progress": false, Done: false
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  // Görevleri fetch et (statü ve sayfa bazlı)
  const fetchTasksByStatus = async (status, nextPage = 1) => {
    if (loadingByStatus[status]) return;

    setLoadingByStatus(prev => ({ ...prev, [status]: true }));

    try {
      const res = await getTasks(projectId, status, nextPage, 10); 
      if (res.length === 0) return; 

      setTasksByStatus(prev => {
        const existingIds = new Set(prev[status].map(t => t.id));
        const newTasks = res.filter(t => !existingIds.has(t.id));
        return {
          ...prev,
          [status]: nextPage === 1 ? res : [...prev[status], ...newTasks],
        };
      });

      setPageByStatus(prev => ({ ...prev, [status]: nextPage }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingByStatus(prev => ({ ...prev, [status]: false }));
    }
  };

  // Yeni veya güncellenmiş task ekleme
 const handleTaskUpdate = (newOrUpdatedTask) => {
  const taskStatus = newOrUpdatedTask.status;
  if (!statuses.includes(taskStatus)) return;

  setTasksByStatus(prev => {
    const newState = {};
    statuses.forEach(s => {
      // Önce eski task’ı tüm statülerden çıkar
      newState[s] = prev[s].filter(t => t.id !== newOrUpdatedTask.id);
    });
    // Yeni veya güncellenmiş task’ı doğru statüye ekle
newState[taskStatus] = [newOrUpdatedTask, ...newState[taskStatus]];
    return newState;
  });
};

  // Status bazlı filtreleme ve arama
  const filteredTasks = (status) => {
    return searchText
      ? tasksByStatus[status].filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()))
      : tasksByStatus[status];
  };

  // Task render
  const renderTask = ({ item }) => {
    const statusStyle = item.status === "Done" ? styles.statusDone :
                        item.status === "In Progress" ? styles.statusProgress :
                        item.status === "Backlog" ? styles.statusBacklog :
                        styles.statusTodo;

    return (
      <TouchableOpacity style={styles.taskCard} onPress={() => setSelectedTask(item)}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={3}>{item.description || "No description available."}</Text>
        <View style={styles.taskFooter}>
          <View style={styles.assigneeTag}>
            {item.assigned_to_avatar ? 
              <Image source={{ uri: item.assigned_to_avatar }} style={styles.assigneeAvatar} /> 
              : <View style={styles.assigneeIcon}><Text style={styles.assigneeIconText}>👤</Text></View>}
            <Text style={styles.assigneeText} numberOfLines={1}>{item.assigned_to_name || "Unassigned"}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.taskDate}>
              📅 {new Date(item.created_at).toLocaleDateString("tr-TR")}
            </Text>
            <Text style={[styles.statusBadge, statusStyle]}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    statuses.forEach(status => fetchTasksByStatus(status, 1));

    const unsubscribe = navigation.addListener('focus', () => {
      const loadUser = async () => {
        const user = JSON.parse(await AsyncStorage.getItem("user"));
        if (user) {
          setUserName(user.name);
          setUserAvatar(user.avatar);
        }
      };
      loadUser();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogoPress = () => { Linking.openURL("https://www.rastmobile.com/tr"); };

  return (
    <View style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleLogoPress}>
          <Image source={require("../assets/rast-mobile-logo1.png")} style={styles.logo} resizeMode="contain"/>
        </TouchableOpacity>
        {showSearch ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            placeholderTextColor="#ccc"
            onSubmitEditing={() => setShowSearch(false)} 
          />
        ) : (
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowSearch(prev => !prev)}>
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        {statuses.map(status => (
          <View key={status}>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>{status}</Text>
              <Text style={styles.sectionCount}>{filteredTasks(status).length}</Text>
            </View>
            <FlatList
              data={filteredTasks(status) || []}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              keyExtractor={(item) => item.id.toString() + item.status}
              renderItem={renderTask}
              onEndReached={() => fetchTasksByStatus(status, pageByStatus[status] + 1)}
              onEndReachedThreshold={0.5}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomBar}>
  <TouchableOpacity onPress={() => {
  navigation.reset({
    index: 0,
    routes: [{ name: "Home" }],
  });
}}>
  <Ionicons name="home-outline" size={26} color="#7b2ff7" />
</TouchableOpacity>
  <TouchableOpacity onPress={() => Linking.openURL("https://wordninja.ai")} style={styles.bottomLink}>
    <Text style={styles.bottomLinkText}>Go to Word Ninja</Text>
  </TouchableOpacity>
</View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Modallar */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
<AddTaskModal
  onClose={() => setShowModal(false)}
  refresh={fetchTasksByStatus}
  onTaskUpdate={handleTaskUpdate}
/>
      </Modal>

      <Modal visible={!!selectedTask} animationType="slide" transparent onRequestClose={() => setSelectedTask(null)}>
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} refresh={fetchTasksByStatus}  onTaskUpdate={handleTaskUpdate} />
      </Modal>

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onShowUserInfo={() => { setShowSettingsModal(false); navigation.navigate("UserInfo"); }}
        onShowChangePassword={() => { setShowSettingsModal(false); navigation.navigate("ChangePassword"); }}
        navigation={navigation}
      />
    </View>
  );
};

export default HomeScreen;

// Stles kodları
const styles = StyleSheet.create({
  container: { 
   flex: 1, 
   backgroundColor: "#F9F9FB" 
},
  headerContainer: { 
   backgroundColor: "#7b2ff7", 
   paddingTop: 10, 
   paddingHorizontal: 20, 
   paddingBottom: 0, 
   flexDirection: "row", 
   justifyContent: "space-between", 
   alignItems: "center" 
},
  headerLeft: { 
   flexDirection: "row", 
   alignItems: "center", 
   gap: 8 
},
  logo: { 
   width: 110, 
   height: 110 
},
  headerIcons: { 
   flexDirection: "row", 
   gap: 20 
},
  searchInput: { 
   backgroundColor: "#fff",
   borderRadius: 8, 
   paddingHorizontal: 12, 
   paddingVertical: 6, 
   flex: 1, 
   marginRight: 10, 
   color: "#000" 
},
  section: { 
   fontWeight: "700", 
   fontSize: 18, 
   marginVertical: 10, 
   marginLeft: 10 
},
  flatListContent: { 
   paddingLeft: 10, 
   paddingBottom: 10 
},
  taskCard: { 
   backgroundColor: "#fff", 
  marginHorizontal: 8, 
  marginVertical: 5, 
  padding: 12, 
  borderRadius: 12, 
  width: 250, 
  height: 180,
  shadowColor: "#000", 
  shadowOffset: { width: 0, height: 2 }, 
  shadowOpacity: 0.2, 
  shadowRadius: 4, 
  elevation: 3,
  justifyContent: "space-between",
},
  taskTitle: { 
   fontWeight: "700", 
   fontSize: 16 
},
  taskDescription: { 
   fontSize: 14, 
  color: "#333", 
  marginTop: 5, 
  flexShrink: 1, 
  height: 54,
},
  assigneeTag: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4
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
  marginTop: 10,
  borderTopWidth: 0.5,
  borderTopColor: "#eee",
  paddingTop: 8,
  flexDirection: "column", 
  justifyContent: "flex-end",
  gap: 4
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
   color: "#fff",
   alignSelf: "flex-end"
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
  addButton: { 
   position: "absolute",
   bottom: 95, 
   right: 25,
   backgroundColor: "#7b2ff7",
   borderRadius: 30,
   width: 60,
   height: 60,
   alignItems: "center",
   justifyContent: "center",
   shadowColor: "#000",
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.3,
   shadowRadius: 4,
   elevation: 12,
   zIndex: 10, 
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
  bottomLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomLinkText: {
    color: "#7b2ff7",
    fontWeight: "600",
    fontSize: 15,
  },
  sectionRow: {
   flexDirection: "row",
   alignItems: "center",
   marginLeft: 10,
   marginTop: 10,
},
section: {
  fontWeight: "700",
  fontSize: 18,
  color: "#000", 
},
sectionCount: {
  fontSize: 16,
  color: "#B0B0B0", 
  marginLeft: 6,
  fontWeight: "500",
},
projectHeader: { 
  backgroundColor: "#fff",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  marginHorizontal: 16,
  marginTop: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  flexDirection: "row",
  alignItems: "center",
},
projectHeaderLeft: {
  flexDirection: "row",
  alignItems: "center",
},
projectIcon: {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: "#F0E9FF",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},
projectMainTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#111",
},
projectSubTitle: {
  fontSize: 13,
  color: "#6F6F6F",
  marginTop: 2,
},
});