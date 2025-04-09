import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
//import { WebSocket } from "react-native-websocket";

const WebSocketScreen = ({ navigation }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWebSocket = () => {
    const websocket = new WebSocket("ws://192.168.4.1/ws"); // Replace with your ESP32 WebSocket URL

    websocket.onopen = () => {
      setConnected(true);
      Alert.alert("Success", "Connected to WebSocket!");
    };

    websocket.onmessage = (event) => {
      console.log("Received Data:", event.data);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      Alert.alert("Error", "Failed to connect to WebSocket.");
    };

    websocket.onclose = () => {
      setConnected(false);
      console.log("WebSocket Disconnected");
    };

    setWs(websocket);
  };

  useEffect(() => {
    return () => {
      if (ws) ws.close(); // Close WebSocket connection on unmount
    };
  }, [ws]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Connection</Text>
      <TouchableOpacity
        style={styles.connectButton}
        onPress={connectWebSocket}
        disabled={connected}
      >
        <Text style={styles.connectButtonText}>
          {connected ? "Connected" : "Connect"}
        </Text>
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
  connectButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
  },
  connectButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default WebSocketScreen;