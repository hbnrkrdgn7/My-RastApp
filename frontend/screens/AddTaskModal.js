/**
 * AddTaskModal.js
 * 
 * Yeni görev oluşturma ve mevcut görev düzenleme modal'ı
 * - Görev başlığı, açıklama, durum ve assignee seçimi
 * - Kullanıcı listesi çekme ve gösterme
 * - Yeni görev oluşturma veya mevcut görev güncelleme
 * - Form validasyonu
 */

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Dropdown seçim için
import { createTask, updateTask } from "../services/api"; // API çağrıları
import Ionicons from "react-native-vector-icons/Ionicons"; // İkonlar için
import axios from "axios"; // HTTP istekleri için

/**
 * AddTaskModal Component
 * 
 * @param {Function} onClose - Modal kapatma fonksiyonu
 * @param {Function} refresh - Ana ekranı yenileme fonksiyonu
 * @param {Object} task - Düzenlenecek görev (opsiyonel)
 * @param {Function} onTaskUpdate - Görev güncelleme callback'i
 */
const AddTaskModal = ({ onClose, refresh, task, onTaskUpdate }) => {
  // Form state'leri
  const [title, setTitle] = useState(""); // Görev başlığı
  const [desc, setDesc] = useState(""); // Görev açıklaması
  const [status, setStatus] = useState(""); // Görev durumu
  const [assignee, setAssignee] = useState(""); // Atanan kullanıcı
  const [users, setUsers] = useState([]); // Kullanıcı listesi
  const [loadingUsers, setLoadingUsers] = useState(true); // Yükleme durumu

  /**
   * Düzenleme modunda görev verilerini form'a yükle
   */
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDesc(task.description || "");
      setStatus(task.status || "");
      setAssignee(task.assignee_id || "");
    }
  }, [task]);

  // 🔹 Kullanıcıları veritabanından çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://192.168.0.247:5000/api/users"); // ✅ backend route: GET /api/users
        setUsers(res.data);
      } catch (err) {
        console.error("Kullanıcılar alınamadı:", err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      if (task) {
        const updated = await updateTask(task.id, {
          title: title.trim(),
          description: desc.trim(),
          status: status || "Backlog",
          assignee_id: assignee || null,
        });

        if (onTaskUpdate) onTaskUpdate(updated);
      } else {
        const result = await createTask({
          project_id: 1,
          title: title.trim(),
          description: desc.trim(),
          status: status || "Backlog",
          assignee_id: assignee || null,
        });
      }

      if (typeof refresh === "function") refresh();
      onClose();
    } catch (err) {
      console.error(
        "Task kaydedilemedi:",
        err.response ? err.response.data : err.message
      );
    }
  };

  const isSaveDisabled = !title.trim() || !status.trim();

  return (
    <View style={styles.container}>
      <View style={styles.modalCard}>
        {/* X Kapatma butonu */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.header}>{task ? "Edit Task" : "New Task"}</Text>

        {/* Title */}
        <TextInput
          placeholder="Title*"
          placeholderTextColor="#bbb"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <TextInput
          placeholder="Description"
          placeholderTextColor="#bbb"
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        {/* Status Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={status}
            onValueChange={(value) => setStatus(value)}
            style={styles.picker}
          >
            <Picker.Item label="Status*" value="" color="#aaa" />
            <Picker.Item label="Backlog" value="Backlog" />
            <Picker.Item label="To Do" value="To Do" />
            <Picker.Item label="In Progress" value="In Progress" />
            <Picker.Item label="Done" value="Done" />
          </Picker>
        </View>

        {/* Assignee Picker */}
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

        {/* Save Button */}
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

// ---------- STYLES ----------
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

export default AddTaskModal;
