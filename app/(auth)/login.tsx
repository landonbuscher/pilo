import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(protected)"); // go to home after login
    } catch (err: any) {
      Alert.alert("Login failed", err.message);
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
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Login</Text>
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
      <Button title="Log In" onPress={handleLogin} />
      <Button
        title="Not a member? Sign Up"
        onPress={() => router.push("/signup")}
      />
    </View>
  );
}
