import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/Navigation/navigation";
import "./src/services/firebaseConfig"; // Initialize Firebase at app startup

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Navigation />
    </NavigationContainer>
  );
}
