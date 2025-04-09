import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const HomeScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User is not authenticated.");
      Alert.alert("Error", "You must be logged in to access your devices.");
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "users", userId, "devices"),
      (snapshot) => {
        const fetchedDevices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(fetchedDevices);
      },
      (error) => {
        console.error("Error fetching devices:", error);
        Alert.alert("Error", "Failed to fetch devices. Please check your permissions.");
      }
    );

    return () => unsubscribe();
  }, []);

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => navigation.navigate("DeviceDetails", { device: item })}
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={<Text style={styles.emptyText}>No devices found.</Text>}
      />
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => navigation.navigate("ConnectionScreen")}
      >
        <Text style={styles.connectButtonText}>Connect Device</Text>
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
  connectButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  connectButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default HomeScreen;
