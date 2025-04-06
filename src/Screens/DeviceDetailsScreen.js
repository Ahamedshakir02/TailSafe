import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const DeviceDetailsScreen = ({ route, navigation }) => {
  const { device } = route.params; // Get the device passed from HomeScreen
  const [deviceName, setDeviceName] = useState(device.name); // Editable device name

  const handleSaveName = async () => {
    try {
      const db = getFirestore();
      const userId = "currentUserId"; // Replace with the logged-in user's ID
      const deviceRef = doc(db, "users", userId, "devices", device.id);

      await updateDoc(deviceRef, { name: deviceName });
      Alert.alert("Success", "Device name updated successfully!");
    } catch (error) {
      console.error("Error updating device name:", error);
      Alert.alert("Error", "Failed to update the device name.");
    }
  };

  const navigateToMap = () => {
    navigation.navigate("Map", {
      device,
      useBLE: true, // or false, depending on the connection type
      serviceUuid: device.serviceUuid,
      characteristicUuid: device.characteristicUuid,
      websocketUrl: device.websocketUrl,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Details</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Device ID:</Text>
        <Text style={styles.value}>{device.id}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Device Name:</Text>
        <TextInput
          style={styles.input}
          value={deviceName}
          onChangeText={setDeviceName}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
        <Text style={styles.saveButtonText}>Save Name</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.mapButton} onPress={navigateToMap}>
        <Text style={styles.mapButtonText}>View on Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  detailContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "gray",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  mapButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 5,
  },
  mapButtonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default DeviceDetailsScreen;