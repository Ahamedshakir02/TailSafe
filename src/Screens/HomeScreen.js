import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "firebase/firestore";

const HomeScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    // Fetch devices from Firebase
    const unsubscribe = onSnapshot(collection(db, "devices"), (snapshot) => {
      const deviceList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Remove duplicates based on the `id` field
      const uniqueDevices = Array.from(
        new Map(deviceList.map((device) => [device.id, device])).values()
      );

      setDevices(uniqueDevices);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const toggleProfile = () => {
    if (isProfileOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsProfileOpen(false));
    } else {
      setIsProfileOpen(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderDevice = ({ item }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Profile Picture Button */}
      <TouchableOpacity style={styles.profileButton} onPress={toggleProfile}>
        <Image
          source={{ uri: userData?.profilePicture || "https://via.placeholder.com/50" }} // Use user's profile picture
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Sliding Profile Panel */}
      {isProfileOpen && (
        <Animated.View
          style={[
            styles.profilePanel,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 0], // Adjust height as needed
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: userData?.profilePicture || "https://via.placeholder.com/100" }} // Use user's profile picture
            style={styles.largeProfileImage}
          />
          <Text style={styles.userName}>{userData?.name || "User Name"}</Text> {/* Use user's name */}
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main Content */}
      <Text style={styles.title}>Your Devices</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={<Text style={styles.emptyText}>No devices added yet.</Text>}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddDevice")} // Navigate to AddDeviceScreen
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  profileButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profilePanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  largeProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingsButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  settingsText: {
    color: "#FFF",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 100,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
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
});

export default HomeScreen;
