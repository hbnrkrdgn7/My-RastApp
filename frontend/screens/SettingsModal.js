import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const SettingsModal = ({ visible, onClose, navigation }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Settings</Text>

          <TouchableOpacity 
            style={styles.option} 
            onPress={() => {
              onClose();
              navigation.navigate("UserInfo");
            }}
          >
            <Ionicons name="person-outline" size={20} color="#7b2ff7" />
            <Text style={styles.optionText}>Profile Info</Text>
          </TouchableOpacity>
           <TouchableOpacity 
  style={styles.option} 
  onPress={() => {
    onClose();
    navigation.navigate("MyTasks");
  }}
>
  <Ionicons name="clipboard-outline" size={20} color="#7b2ff7" />
  <Text style={styles.optionText}>My Tasks</Text>
</TouchableOpacity>

          <TouchableOpacity 
            style={styles.option} 
            onPress={() => {
              onClose();
              navigation.navigate("ChangePassword");
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#7b2ff7" />
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option} 
            onPress={() => {
              onClose();
              navigation.navigate("Login");
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#7b2ff7" />
            <Text style={styles.optionText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: "#fff" }}>Close</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </Modal>
  );
};

export default SettingsModal;

// Styles kodları
const styles = StyleSheet.create({
  modalContainer: {
   flex: 1, 
   justifyContent: "center", 
   alignItems: "center", 
   backgroundColor: "rgba(0,0,0,0.5)" 
},
  modalContent: { 
   backgroundColor: "#fff", 
   borderRadius: 12, 
   padding: 20, 
   width: 300 
},
  title: { 
   fontSize: 18, 
   fontWeight: "700", 
   marginBottom: 15 
},
  option: { 
   flexDirection: "row", 
   alignItems: "center", 
   paddingVertical: 10, 
   gap: 10 
},
  optionText: { 
   fontSize: 16 
},
  closeButton: { 
   marginTop: 15, 
   backgroundColor: "#7b2ff7", 
   padding: 10, 
   borderRadius: 8, 
   alignItems: "center" 
}
});
