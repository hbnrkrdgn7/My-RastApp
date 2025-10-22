/**
 * HomeScreen.js
 * Ana ekran
 */

import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Image, Alert, Linking
} from "react-native";
import { getTasks } from "../services/api";
import AddTaskModal from "./AddTaskModal";
import TaskDetail from "./TaskDetail";
import Ionicons from "react-native-vector-icons/Ionicons";
import SettingsModal from "./SettingsModal";

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const projectId = 1;

  const fetchTasks = async () => {
    try {
      const res = await getTasks(projectId);
      setTasks(res.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) { console.error(err); }
  };

  const handleTaskUpdate = (newOrUpdatedTask) => {
    setTasks(prev => [newOrUpdatedTask, ...prev.filter(t => t.id !== newOrUpdatedTask.id)]);
  };

  const groupedTasks = (status) => {
    return searchText
      ? tasks.filter(t => t.status === status && t.title.toLowerCase().includes(searchText.toLowerCase()))
      : tasks.filter(t => t.status === status);
  };

  const renderTask = ({ item }) => {
    const statusStyle = item.status === "Done" ? styles.statusDone :
                        item.status === "In Progress" ? styles.statusProgress :
                        item.status === "Backlog" ? styles.statusBacklog :
                        styles.statusTodo;

    return (
      <TouchableOpacity style={styles.taskCard} onPress={() => setSelectedTask(item)}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={3}>{item.description || "No description available."}</Text>

        {item.assigned_to_name && (
          <View style={styles.assigneeTag}>
            {item.assigned_to_avatar ? <Image source={{ uri: item.assigned_to_avatar }} style={styles.assigneeAvatar} />
              : <View style={styles.assigneeIcon}><Text style={styles.assigneeIconText}>👤</Text></View>}
            <Text style={styles.assigneeText} numberOfLines={1}>{item.assigned_to_name}</Text>
          </View>
        )}
        

        <View style={styles.taskFooter}>
<Text style={styles.taskDate}>
  📅 {new Date(item.created_at).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}
</Text>
          <Text style={[styles.statusBadge, statusStyle]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleLogoPress = () => { Linking.openURL("https://www.rastmobile.com/tr"); };

  return (
  <View style={styles.container}>
    {/* 🔹 Üst Bar */}
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
          onChangeText={setSearchText}
          onSubmitEditing={() => setShowSearch(false)}
          autoFocus
          placeholderTextColor="#ccc"
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

    {/* 🔹 Proje Başlığı Bölümü */}
    <View style={styles.projectHeader}>
  <View style={styles.projectHeaderLeft}>
    <View style={styles.projectIcon}>
      <Ionicons name="code-slash" size={20} color="#7B2FF7" />
    </View>
    <View>
      <Text style={styles.projectMainTitle}>Refactoring for Word Ninja</Text>
      <Text style={styles.projectSubTitle}>New project for refactoring our app Word Ninja</Text>
    </View>
  </View>
</View>

      <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 150 }} // 🔥 Alt bar + boşluk için
>
  {/* Project sections */}
<View style={styles.sectionRow}>
  <Text style={styles.section}>Backlog</Text>
  <Text style={styles.sectionCount}>{groupedTasks("Backlog").length}</Text>
</View>
<FlatList
  data={groupedTasks("Backlog")}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.flatListContent}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderTask}
/>

<View style={styles.sectionRow}>
  <Text style={styles.section}>To Do</Text>
  <Text style={styles.sectionCount}>{groupedTasks("To Do").length}</Text>
</View>
<FlatList
  data={groupedTasks("To Do")}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.flatListContent}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderTask}
/>

<View style={styles.sectionRow}>
  <Text style={styles.section}>In Progress</Text>
  <Text style={styles.sectionCount}>{groupedTasks("In Progress").length}</Text>
</View>
<FlatList
  data={groupedTasks("In Progress")}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.flatListContent}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderTask}
/>

<View style={styles.sectionRow}>
  <Text style={styles.section}>Done</Text>
  <Text style={styles.sectionCount}>{groupedTasks("Done").length}</Text>
</View>
<FlatList
  data={groupedTasks("Done")}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.flatListContent}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderTask}
/>

</ScrollView>


      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <AddTaskModal onClose={() => setShowModal(false)} refresh={fetchTasks} onTaskAdded={handleTaskUpdate} />
      </Modal>

      <Modal visible={!!selectedTask} animationType="slide" transparent onRequestClose={() => setSelectedTask(null)}>
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} refresh={fetchTasks} />
      </Modal>

      {/* Yeni modallar */}
      <SettingsModal
  visible={showSettingsModal}
  onClose={() => setShowSettingsModal(false)}
  onShowUserInfo={() => {
    setShowSettingsModal(false);
    navigation.navigate("UserInfo"); // artık modal değil, yeni sayfa
  }}
  onShowChangePassword={() => {
    setShowSettingsModal(false);
    navigation.navigate("ChangePassword"); // yeni sayfa
  }}
  navigation={navigation}
/>
{/* Alt Bar (Bottom Navigation) */}
<View style={styles.bottomBar}>
  <TouchableOpacity onPress={() => navigation.navigate("Home")}>
    <Ionicons name="home-outline" size={26} color="#7b2ff7" />
  </TouchableOpacity>

  <TouchableOpacity onPress={() => Linking.openURL("https://wordninja.ai")} style={styles.bottomLink}>
    <Text style={styles.bottomLinkText}>Go to Word Ninja</Text>
  </TouchableOpacity>
</View>

    </View>
  );
};

export default HomeScreen;

// ---------- STYLES ----------
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
  paddingBottom: 10 },
  taskCard: { 
  backgroundColor: "#fff", 
  marginHorizontal: 8, 
  marginVertical: 5, 
  padding: 12, 
  borderRadius: 12, 
  width: 250, 
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
  addButton: { 
  position: "absolute",
  bottom: 95, // alt barın biraz üstünde kalsın
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
