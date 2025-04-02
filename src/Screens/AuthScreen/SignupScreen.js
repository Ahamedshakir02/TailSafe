import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig"; // Import Firestore from your Firebase config file

const SignupScreen = ({ navigation }) => {
  const auth = getAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !phone || !dob) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Convert DOB to Firestore Date format (optional)
      const dobFormatted = new Date(dob.split("/").reverse().join("-"));

      // Save extra details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        dob: dobFormatted, // Store as Date
        uid: user.uid,
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.replace("Profile"); // Redirect to Profile screen
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Date of Birth (DD/MM/YYYY)" value={dob} onChangeText={setDob} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <TouchableOpacity onPress={handleSignup} style={styles.button} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: "#007BFF", padding: 15, alignItems: "center", borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
};

export default SignupScreen;
