import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { BleManager } from "react-native-ble-plx";
import { db } from "../services/firebaseConfig"; // Import Firebase config
import { doc, setDoc } from "firebase/firestore";

const AddDeviceScreen = ({ navigation }) => {
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const manager = new BleManager();

  const scanDevices = () => {
    setDiscoveredDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan Error:", error);
        return;
      }

      if (device.name && device.name.includes("TrailSafe-BLE")) {
        setDiscoveredDevices((prevDevices) => {
          if (!prevDevices.find((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
    }, 5000);
  };

  const connectToDevice = async (device) => {
    try {
      console.log("Connecting to device:", device.name);
      const connectedDevice = await manager.connectToDevice(device.id);
      console.log("Connected to device:", connectedDevice.name);

      const serviceUuid = "12345678-1234-1234-1234-1234567890ab";
      const characteristicUuid = "abcd1234-abcd-1234-abcd-1234567890ab";
      const websocketUrl = "ws://192.168.4.1/ws";

      console.log("Saving device details to Firebase...");
      const userId = "currentUserId"; // Replace with the logged-in user's ID
      await setDoc(doc(db, "users", userId, "devices", device.id), {
        name: device.name,
        id: device.id,
        serviceUuid,
        characteristicUuid,
        websocketUrl,
      });

      Alert.alert("Success", "Device connected successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error in connectToDevice:", error);
      Alert.alert("Error", "Failed to connect to the device.");
    }
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Device</Text>
      <TouchableOpacity style={styles.scanButton} onPress={scanDevices}>
        <Text style={styles.scanButtonText}>Scan for Devices</Text>
      </TouchableOpacity>
      <FlatList
        data={discoveredDevices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={<Text style={styles.emptyText}>No devices found.</Text>}
      />
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
  scanButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  deviceItem: {
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deviceId: {
    fontSize: 14,
    color: "gray",
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
});

export default AddDeviceScreen;