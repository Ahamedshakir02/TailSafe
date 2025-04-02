import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]); // Store past locations

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setRouteCoordinates((prevCoords) => [...prevCoords, currentLocation.coords]); // Add to route

      // Watch position continuously
      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
        (newLocation) => {
          setLocation(newLocation.coords);
          setRouteCoordinates((prevCoords) => [...prevCoords, newLocation.coords]);
        }
      );

      return () => locationSubscription.remove(); // Cleanup
    })();
  }, []);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
          <Marker coordinate={location} title="Current Location" />
        </MapView>
      ) : (
        <Text>Loading Location...</Text>
      )}
    </View>
  );
}
0
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});
