import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Image } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { BleManager } from "react-native-ble-plx";
import carIcon from "../../assets/car-icon.jpg"; // Import the car icon

const MapScreen = ({ route }) => {
  const { device, useBLE, serviceUuid, characteristicUuid, websocketUrl } = route.params; // Retrieve values from route.params
  const [trackerLocation, setTrackerLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const manager = new BleManager();

  useEffect(() => {
    if (useBLE) {
      connectToBLEDevice(serviceUuid, characteristicUuid);
    } else {
      connectToWebSocket(websocketUrl);
    }

    return () => {
      if (useBLE) {
        manager.destroy(); // Cleanup BLE manager
      }
    };
  }, [useBLE]);

  const connectToBLEDevice = async (serviceUuid, characteristicUuid) => {
    try {
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();

      connectedDevice.monitorCharacteristicForService(
        serviceUuid,
        characteristicUuid,
        (error, characteristic) => {
          if (error) {
            console.error("Error receiving data via BLE:", error);
            return;
          }

          const receivedData = characteristic.value; // Base64 encoded data
          const decodedData = atob(receivedData); // Decode Base64
          console.log("Received Data via BLE:", decodedData);

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

  const connectToWebSocket = (websocketUrl) => {
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
      console.log("Connected to ESP32 WebSocket");
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("Received Data via WebSocket:", message);

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

  const parseESP32Data = (data) => {
    const gpsMatch = data.match(/GPS: ([\d.-]+), ([\d.-]+)/);
    return gpsMatch
      ? { latitude: parseFloat(gpsMatch[1]), longitude: parseFloat(gpsMatch[2]) }
      : null;
  };

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
        showsUserLocation={true}
        onUserLocationChange={(e) => {
          const userCoordinate = e.nativeEvent.coordinate;
          if (userCoordinate) {
            setRouteCoordinates((prev) => [...prev, userCoordinate]);
          }
        }}
      >
        <Marker
          coordinate={{
            latitude: trackerLocation.latitude,
            longitude: trackerLocation.longitude,
          }}
          title={device.name}
          description={`Latitude: ${trackerLocation.latitude}, Longitude: ${trackerLocation.longitude}`}
        >
          <Image source={carIcon} style={{ width: 40, height: 40 }} />
        </Marker>
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
}

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
