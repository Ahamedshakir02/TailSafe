import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [devices, setDevices] = useState([]); // Connected devices

  useEffect(() => {
    const db = getFirestore();
    const userId = "currentUserId"; // Replace with the logged-in user's ID
    const unsubscribe = onSnapshot(
      collection(db, "users", userId, "devices"),
      (snapshot) => {
        const fetchedDevices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(fetchedDevices);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() =>
        navigation.navigate("DeviceDetails", { device: item }) // Pass the entire device object
      }
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Devices</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={<Text style={styles.emptyText}>No devices found.</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddDevice")}
      >
        <Text style={styles.addButtonText}>+</Text>
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
  addButton: {
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  addButtonText: {
    fontSize: 30,
    color: "#FFF",
  },
});

export default HomeScreen;
