import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { router } from "expo-router";

export default function UploadScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const handleUpload = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "flights"), {
        userId: user.uid,
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Flight uploaded");
      router.replace("/"); // optional: go back to home
    } catch (err: any) {
      Alert.alert("Error uploading flight", err.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Upload a Flight</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderBottomWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Date (e.g. 2024-05-18)"
        value={date}
        onChangeText={setDate}
        style={{ borderBottomWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ borderWidth: 1, padding: 8, height: 100 }}
      />

      <Button title="Upload Flight" onPress={handleUpload} />
    </View>
  );
}
