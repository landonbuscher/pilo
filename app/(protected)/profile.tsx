import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { signOut } from "firebase/auth";
import { storage, db, auth } from "../../lib/firebase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState<string>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login"); // Send user back to login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        name,
        bio,
      });

      Alert.alert("Success", "Profile updated!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      Alert.alert("Error", "Could not update profile.");
    }
  };

  const handleImagePick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need camera roll access to upload your photo."
      );
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];

      const manipulated = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 400 } }], // you can adjust this
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(manipulated.uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      // Save URL to Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: downloadURL,
      });

      setPhotoURL(downloadURL); // update UI
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setBio(data.bio);
        setPhotoURL(data.photoURL);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>👤 Profile</Text>
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={{ uri: photoURL }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 20,
          }}
        />
      </TouchableOpacity>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Logged in as: {auth.currentUser?.email}
      </Text>
      <Text style={{ fontWeight: "bold" }}>Name:</Text>
      <Text style={{ marginBottom: 10 }}>{name || "Not set"}</Text>
      <Text style={{ fontWeight: "bold" }}>Bio:</Text>
      <Text style={{ marginBottom: 20 }}>{bio || "No bio yet"}</Text>
      <Text style={{ fontWeight: "bold" }}>Edit Name:</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 10,
        }}
      />

      <Text style={{ fontWeight: "bold" }}>Edit Bio:</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 20,
        }}
      />

      <Button title="Save Profile" onPress={handleSave} />
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}
