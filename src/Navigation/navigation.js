import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../services/firebaseConfig";
import HomeScreen from "../Screens/HomeScreen";
import MapScreen from "../Screens/MapScreen";
import AlertsScreen from "../Screens/AlertsScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import SignInScreen from "../Screens/AuthScreen/SigninScreen";
import SignUpScreen from "../Screens/AuthScreen/SignupScreen";
import AddDeviceScreen from "../Screens/AddDeviceScreen";
import ConnectionScreen from "../Screens/ConnectionScreen"; // New screen
import BLEScreen from "../Screens/BLEScreen"; // New screen
import WebSocketScreen from "../Screens/WebSocketScreen"; // New screen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Home") iconName = "home";
        else if (route.name === "Map") iconName = "map";
        else if (route.name === "Alerts") iconName = "notifications";
        else if (route.name === "Profile") iconName = "person";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007BFF",
      tabBarInactiveTintColor: "gray",
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Alerts" component={AlertsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const Navigation = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user); // Debugging
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
          <Stack.Screen name="ConnectionScreen" component={ConnectionScreen} />
          <Stack.Screen name="BLEScreen" component={BLEScreen} />
          <Stack.Screen name="WebSocketScreen" component={WebSocketScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;