import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createTask, updateTask } from "../services/api";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddTaskModal = ({ onClose, refresh, task, onTaskUpdate }) => {
  // Form state'leri
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDesc(task.description || "");
      setStatus(task.status || "");
      setAssignee(task.assignee_id || "");
    }
  }, [task]);

  // Kullanıcıları çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://192.168.1.36:5000/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Kullanıcılar alınamadı:", err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Kaydetme / Güncelleme fonksiyonu
  const handleSave = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const currentUser = JSON.parse(userData);

      if (!currentUser || !currentUser.id) {
        return alert("Lütfen tekrar giriş yapın!");
      }

      // FRONTEND VALIDATION
      if (!title.trim() || title.trim().length < 3) {
        return alert("Title en az 3 karakter olmalıdır!");
      }
      if (!status.trim()) {
        return alert("Status seçilmelidir!");
      }
      if (assignee && !users.some(u => u.id === assignee)) {
        return alert("Geçersiz assignee seçimi!");
      }

      // Görev oluşturma veya güncelleme
      if (task) {
        const updated = await updateTask(task.id, {
          title: title.trim(),
          description: desc.trim(),
          status,
          assignee_id: assignee || null,
          updated_by: Number(currentUser.id),
        });
        if (onTaskUpdate) onTaskUpdate(updated);
      } else {
        await createTask({
          project_id: 1,
          title: title.trim(),
          description: desc.trim(),
          status,
          assignee_id: assignee || null,
          created_by: Number(currentUser.id),
        });
      }

      if (typeof refresh === "function") refresh();
      onClose();

    } catch (err) {
      const message = err.response?.data?.message || "Görev kaydedilemedi. Lütfen tekrar deneyin.";
      alert(message);
      console.error("Task kaydedilemedi:", message);
    }
  };

  const isSaveDisabled = !title.trim() || !status.trim();

  return (
    <View style={styles.container}>
      <View style={styles.modalCard}>
        {/* 🔹 Kapat butonu */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.header}>{task ? "Edit Task" : "New Task"}</Text>

        <TextInput
          placeholder="Title*"
          placeholderTextColor="#bbb"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Description"
          placeholderTextColor="#bbb"
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        {/* 🔹 Status Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={status}
            onValueChange={(value) => setStatus(value)}
            style={styles.picker}
          >
            <Picker.Item label="Status*" value="" color="#aaa" />
            <Picker.Item label="Backlog" value="Backlog" />
            <Picker.Item label="Todo" value="Todo" />
            <Picker.Item label="In Progress" value="In Progress" />
            <Picker.Item label="Done" value="Done" />
          </Picker>
        </View>

        {/* 🔹 Assignee Picker */}
        <View style={styles.pickerWrapper}>
          {loadingUsers ? (
            <ActivityIndicator size="small" color="#6C4EFF" />
          ) : (
            <Picker
              selectedValue={assignee}
              onValueChange={(value) => setAssignee(value)}
              style={styles.picker}
            >
              <Picker.Item label="Assignee Seç" value="" color="#aaa" />
              {users.map((user) => (
                <Picker.Item
                  key={user.id}
                  label={`${user.name} ${user.surname}`}
                  value={user.id}
                />
              ))}
            </Picker>
          )}
        </View>

        {/* 🔹 Kaydet butonu */}
        <TouchableOpacity
          style={[styles.saveButton, isSaveDisabled && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddTaskModal;


// Styles kodları 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f5f5f7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: "#f5f5f7",
    borderRadius: 10,
    marginBottom: 12,
  },
  picker: {
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#7b2ff7",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

