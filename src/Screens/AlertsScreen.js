import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore"; // Firebase Firestore

const AlertsScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]); // Alerts fetched from Firestore
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, "alerts"), (snapshot) => {
      const fetchedAlerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(fetchedAlerts);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "critical") return alert.type === "critical";
    if (filter === "informational") return alert.type === "informational";
    return true;
  });

  const searchedAlerts = filteredAlerts.filter((alert) =>
    alert.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAlert = ({ item }) => (
    <TouchableOpacity
      style={styles.alertItem}
      onPress={() => navigation.navigate("AlertDetails", { alertId: item.id })}
    >
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertDescription}>{item.description}</Text>
      <Text style={styles.alertTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts & History</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter("all")}>
          <Text style={filter === "all" ? styles.activeFilter : styles.filter}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("critical")}>
          <Text style={filter === "critical" ? styles.activeFilter : styles.filter}>Critical</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("informational")}>
          <Text style={filter === "informational" ? styles.activeFilter : styles.filter}>Informational</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search alerts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={searchedAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        ListEmptyComponent={<Text style={styles.emptyText}>No alerts available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  filterContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  filter: { fontSize: 16, color: "gray" },
  activeFilter: { fontSize: 16, color: "#007BFF", fontWeight: "bold" },
  searchInput: { borderWidth: 1, borderColor: "#CCC", borderRadius: 5, padding: 10, marginBottom: 10 },
  alertItem: { padding: 15, backgroundColor: "#FFF", borderRadius: 5, marginBottom: 10, elevation: 2 },
  alertTitle: { fontSize: 18, fontWeight: "bold" },
  alertDescription: { fontSize: 14, color: "gray" },
  alertTimestamp: { fontSize: 12, color: "gray", marginTop: 5 },
  emptyText: { textAlign: "center", color: "gray", marginTop: 20 },
});

export default AlertsScreen;
