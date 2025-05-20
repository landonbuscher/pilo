import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

type Flight = {
  title: string;
  description: string;
  date: any;
  userId: string;
  user?: {
    name: string;
    photoURL: string;
  };
};

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlight = async () => {
      if (!id || typeof id !== "string") return;

      const flightRef = doc(db, "flights", id);
      const flightSnap = await getDoc(flightRef);

      if (!flightSnap.exists()) return;

      const data = flightSnap.data() as Flight;

      const userRef = doc(db, "users", data.userId);
      const userSnap = await getDoc(userRef);

      const user = userSnap.exists()
        ? {
            name: userSnap.data().name,
            photoURL: userSnap.data().photoURL ?? "",
          }
        : { name: "Unknown Pilot", photoURL: "" };

      setFlight({ ...data, user });
      setLoading(false);
    };

    loadFlight();
  }, [id]);

  if (loading || !flight) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading flight...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity onPress={router.back} style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 16, color: "#007aff" }}>← Back</Text>
      </TouchableOpacity>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Image
          source={{ uri: flight.user?.photoURL ?? "" }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
        />
        <Text style={{ fontSize: 18 }}>{flight.user?.name}</Text>
      </View>

      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        {flight.title}
      </Text>
      <Text style={{ color: "gray", marginBottom: 10 }}>
        {flight.date.toDate().toLocaleDateString()}
      </Text>
      <Text style={{ fontSize: 16 }}>{flight.description}</Text>
    </ScrollView>
  );
}
