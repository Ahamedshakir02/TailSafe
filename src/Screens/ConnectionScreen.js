import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ConnectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Connection Type</Text>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate("BLEScreen")}
      >
        <Text style={styles.optionButtonText}>BLE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate("WebSocketScreen")}
      >
        <Text style={styles.optionButtonText}>WebSocket</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  optionButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default ConnectionScreen;