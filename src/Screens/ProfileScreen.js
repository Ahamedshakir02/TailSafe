import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to format Firestore Timestamp
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString(); // Converts to "MM/DD/YYYY" format
    }
    return "N/A"; // Return "N/A" if no valid date is found
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            ...data,
            dob: formatDate(data.dob), // Convert Firestore Timestamp to readable format
          });
        } else {
          console.log("No such user data!");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.text}>{userData?.name}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.text}>{userData?.email}</Text>

      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.text}>{userData?.phone}</Text>

      <Text style={styles.label}>Date of Birth:</Text>
      <Text style={styles.text}>{userData?.dob}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontWeight: "bold", fontSize: 16, marginTop: 10 },
  text: { fontSize: 16, marginBottom: 10 },
});

export default ProfileScreen;
