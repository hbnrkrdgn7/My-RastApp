import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Tek bir görevi (task) kart şeklinde gösteren bileşen
const TaskCard = ({ task, onPress }) => {
  return (
    // Kartın tamamına tıklanabilir alan ekliyoruz
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Görev başlığı */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Görev açıklaması */}
      <Text numberOfLines={2} style={styles.desc}>
        {task.description}
      </Text>
    </TouchableOpacity>
  );
};

// Kartın görünüm stilleri
const styles = StyleSheet.create({
  card: {
    width: 250, 
    backgroundColor: "#fff",
    marginRight: 10, 
    padding: 15,
    borderRadius: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 5,
    elevation: 2, 
  },
  title: { 
    fontSize: 16, 
    fontWeight: "bold"
  },
  desc: { 
    fontSize: 13, 
    color: "gray", 
    marginTop: 5 
  },
});

export default TaskCard;
