import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AddTaskModal from "./AddTaskModal";
import { deleteTask } from "../services/api";

const TaskDetail = ({ task, onClose, refresh }) => {
  const [editModalVisible, setEditModalVisible] = useState(false); 
  const [currentTask, setCurrentTask] = useState(null); 

  // Başlangıçta task'i state'e ata
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  if (!currentTask) return null; 

  // Task silme fonksiyonu
  const handleDelete = async () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(currentTask.id); // API ile sil
            if (typeof refresh === "function") refresh(); // Listeyi yenile
            onClose();
          } catch (err) {
            console.error("Task silinemedi:", err.response ? err.response.data : err.message);
          }
        },
      },
    ]);
  };

  // Düzenleme sonrası güncel task'i ata
  const handleTaskUpdated = (updatedTask) => {
    setCurrentTask(updatedTask);
    if (typeof refresh === "function") refresh();
    setEditModalVisible(false); 
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../assets/rast-mobile-logo1.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BODY */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Proje bilgisi */}
          <View style={styles.projectContainer}>
            <View style={styles.projectIcon}>
              <Ionicons name="code-slash" size={22} color="#7b2ff7" />
            </View>
            <View>
              <Text style={styles.projectTitle}>Refactoring for Word Ninja</Text>
              <Text style={styles.projectSubtitle}>
                New project for refactoring our app Word Ninja
              </Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{currentTask.title}</Text>

          {/* Atanan kişi */}
          <View style={styles.reportedContainer}>
            {currentTask.assigned_to_avatar ? (
              <Image source={{ uri: currentTask.assigned_to_avatar }} style={styles.assigneeAvatar} />
            ) : (
              <View style={styles.assigneeIcon}>
                <Ionicons name="person-outline" size={20} color="#7b2ff7" />
              </View>
            )}
            <Text style={styles.reportedText}>
              Assigned to{" "}
              <Text style={styles.reportedBold}>
                {currentTask.assigned_to_name || "Unassigned"}
              </Text>
            </Text>
          </View>

          {/* Durum ve tarih */}
          <View style={styles.statusDateRow}>
            <View
              style={[
                styles.statusBadge,
                currentTask.status === "Done"
                  ? styles.statusDone
                  : currentTask.status === "In Progress"
                  ? styles.statusProgress
                  : styles.statusTodo,
              ]}
            >
              <Text style={styles.statusText}>{currentTask.status}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="time-outline" size={14} color="#999" style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>
                  Eklendi: {new Date(currentTask.created_at).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {currentTask.updated_at &&
                currentTask.updated_at !== currentTask.created_at && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                    <Ionicons name="refresh-outline" size={14} color="#999" style={{ marginRight: 4 }} />
                    <Text style={styles.dateText}>
                      Son Güncelleme: {new Date(currentTask.updated_at).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                )}
            </View>
          </View>

          {/* Açıklama */}
          <Text style={styles.descLabel}>Description</Text>
          <View style={styles.descBox}>
            <Text style={styles.descText}>
              {currentTask.description || "No detailed description provided for this task."}
            </Text>
          </View>

        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footerContainer}>
          <Ionicons name="home-outline" size={24} color="#000" />
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.linkButton}>Go to Word Ninja</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* EDIT MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <AddTaskModal
          onClose={() => setEditModalVisible(false)}
          refresh={refresh}
          task={currentTask}
          onTaskUpdate={(updated) => {
            setCurrentTask(updated);  
            if (typeof refresh === "function") refresh();
            setEditModalVisible(false);
          }}
        />
      </Modal>
    </View>
  );
};

// Styles kodları
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  container: {
    height: "95%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },

  logo: {
    width: 100,
    height: 100,
    marginRight: 6,
    marginBottom: 0,
  },

  headerContainer: {
    backgroundColor: "#7b2ff7",
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLogo: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerIcons: { flexDirection: "row", gap: 18, alignItems: "center" },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scrollContent: {
    padding: 20,
  },

  projectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  projectIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#E8E2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  projectSubtitle: {
    fontSize: 13,
    color: "#777",
  },

  taskTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginTop: 10,
    marginBottom: 8,
  },

  reportedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  assigneeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#7b2ff7",
  },
  assigneeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f8f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e8e2ff",
  },
  reportedText: { color: "#777", fontSize: 13 },
  reportedBold: { color: "#111", fontWeight: "700" },

  statusDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  statusTodo: { backgroundColor: "#7b2ff7" },
  statusProgress: { backgroundColor: "#FFA726" },
  statusDone: { backgroundColor: "#4CAF50" },
  dateText: { fontSize: 13, color: "#999" },

  descLabel: {
    fontWeight: "700",
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  descBox: {
    backgroundColor: "#F4F3F8",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  descText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },


  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 25,
    paddingHorizontal: 25,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  linkButton: {
    fontSize: 16,
    color: "#7b2ff7",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});

export default TaskDetail;
