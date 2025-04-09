import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const AddDeviceScreen = ({ navigation }) => {
  const [deviceName, setDeviceName] = useState("");
  const [devicePhone, setDevicePhone] = useState("");
  const db = getFirestore();

  const handleAddDevice = async () => {
    if (!deviceName || !devicePhone) {
      Alert.alert("Error", "Please enter both device name and phone number.");
      return;
    }

    try {
      await addDoc(collection(db, "devices"), {
        name: deviceName,
        phone: devicePhone,
        location: {
          latitude: 10.8505, // Default latitude (can be updated later)
          longitude: 76.2711, // Default longitude (can be updated later)
        },
      });
      Alert.alert("Success", `Device "${deviceName}" added successfully!`);
      navigation.goBack(); // Navigate back to the HomeScreen
    } catch (error) {
      console.error("Error adding device:", error);
      Alert.alert("Error", "Failed to add device. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Device</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter device name"
        value={deviceName}
        onChangeText={setDeviceName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter device phone number"
        value={devicePhone}
        onChangeText={setDevicePhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
        <Text style={styles.addButtonText}>Add Device</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});