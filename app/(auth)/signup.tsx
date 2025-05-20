import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { router } from "expo-router";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

const DEFAULT_AVATAR_URL =
  "https://firebasestorage.googleapis.com/v0/b/pilo-app-37915.firebasestorage.app/o/defaults%2Fdefault-avatar.png?alt=media&token=adc8480a-1207-4af8-af67-a994a1e56def";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Create Firestore user doc
      await setDoc(doc(db, "users", user.uid), {
        name: "", // can be updated later
        bio: "",
        photoURL: DEFAULT_AVATAR_URL,
        createdAt: serverTimestamp(),
      });

      router.replace("/(protected)");
    } catch (err: any) {
      Alert.alert("Sign Up failed", err.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Sign Up</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 10, borderBottomWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 20, borderBottomWidth: 1, padding: 8 }}
      />
      <Button title="Create Account" onPress={handleSignUp} />
    </View>
  );
}
