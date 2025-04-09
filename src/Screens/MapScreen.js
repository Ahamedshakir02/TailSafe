import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { BleManager } from "react-native-ble-plx";

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab"; // Replace with your ESP32 Service UUID
const CHARACTERISTIC_UUID = "abcd1234-abcd-1234-abcd-1234567890ab"; // Replace with your ESP32 Characteristic UUID
const ESP32_WEBSOCKET_URL = "ws://192.168.4.1/ws"; // Replace with your ESP32 WebSocket URL

const MapScreen = ({ route }) => {
  const { device, useBLE } = route.params; // `useBLE` determines whether to use BLE or WebSocket
  const [trackerLocation, setTrackerLocation] = useState(null); // Tracker's real-time location
  const [routeCoordinates, setRouteCoordinates] = useState([]); // Store route coordinates
  const manager = new BleManager();

  useEffect(() => {
    if (useBLE) {
      connectToBLEDevice();
    } else {
      connectToWebSocket();
    }

    return () => {
      if (useBLE) {
        manager.destroy(); // Cleanup BLE manager
      }
    };
  }, [useBLE]);

  // ----------- BLE Connection -----------
  const connectToBLEDevice = async () => {
    try {
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Start listening for GPS data
      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Error receiving data via BLE:", error);
            return;
          }

          const receivedData = characteristic.value; // Base64 encoded data
          const decodedData = atob(receivedData); // Decode Base64
          console.log("Received Data via BLE:", decodedData);

          // Parse and update GPS data
          const parsedData = parseESP32Data(decodedData);
          if (parsedData) {
            setTrackerLocation(parsedData);
            setRouteCoordinates((prev) => [...prev, parsedData]);
          }
        }
      );
    } catch (error) {
      console.error("BLE Connection Error:", error);
      Alert.alert("Error", "Failed to connect to the device via BLE.");
    }
  };

  // ----------- WebSocket Connection -----------
  const connectToWebSocket = () => {
    const ws = new WebSocket(ESP32_WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("Connected to ESP32 WebSocket");
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("Received Data via WebSocket:", message);

      // Parse and update GPS data
      const parsedData = parseESP32Data(message);
      if (parsedData) {
        setTrackerLocation(parsedData);
        setRouteCoordinates((prev) => [...prev, parsedData]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      Alert.alert("Error", "Failed to connect to WebSocket.");
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => ws.close(); // Cleanup WebSocket on unmount
  };

  // ----------- Data Parsing Function -----------
  const parseESP32Data = (data) => {
    const gpsMatch = data.match(/GPS: ([\d.-]+), ([\d.-]+)/);
    return gpsMatch
      ? { latitude: parseFloat(gpsMatch[1]), longitude: parseFloat(gpsMatch[2]) }
      : null;
  };

  // ----------- Open Directions in Google Maps -----------
  const showDirections = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Failed to open Google Maps.");
    });
  };

  if (!trackerLocation) {
    return (
      <View style={styles.container}>
        <Text>Loading tracker location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: trackerLocation.latitude,
          longitude: trackerLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Tracker Marker */}
        <Marker
          coordinate={{
            latitude: trackerLocation.latitude,
            longitude: trackerLocation.longitude,
          }}
          title={device.name}
          description={`Latitude: ${trackerLocation.latitude}, Longitude: ${trackerLocation.longitude}`}
        />

        {/* Route Polyline */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#007BFF"
          strokeWidth={4}
        />
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text>Latitude: {trackerLocation.latitude}</Text>
        <Text>Longitude: {trackerLocation.longitude}</Text>
        <Text
          style={styles.directionsLink}
          onPress={() =>
            showDirections(trackerLocation.latitude, trackerLocation.longitude)
          }
        >
          Show Directions
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#CCC",
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  directionsLink: {
    color: "#007BFF",
    marginTop: 10,
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default MapScreen;
