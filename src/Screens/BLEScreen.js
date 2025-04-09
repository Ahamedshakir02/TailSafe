import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

const BLEScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const manager = new BleManager();

  const scanDevices = () => {
    setDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("BLE Scan Error:", error);
        return;
      }

      if (device.name && device.name.includes("TrailSafe")) {
        setDevices((prevDevices) => {
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
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      Alert.alert("Success", `Connected to ${device.name}`);
      navigation.navigate("Home"); // Navigate back to Home after connection
    } catch (error) {
      console.error("BLE Connection Error:", error);
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
      <Text style={styles.title}>BLE Devices</Text>
      <TouchableOpacity style={styles.scanButton} onPress={scanDevices}>
        <Text style={styles.scanButtonText}>Scan for Devices</Text>
      </TouchableOpacity>
      <FlatList
        data={devices}
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

export default BLEScreen;