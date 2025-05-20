import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";
import { getDoc, doc } from "firebase/firestore";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { router } from "expo-router";

type Flight = {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  userId: string;
  user: {
    name: string;
    photoURL?: string;
  };
};

export default function HomeScreen() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const fetchFlights = async () => {
    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const q = showOnlyMine
        ? query(
            collection(db, "flights"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
          )
        : query(collection(db, "flights"), orderBy("createdAt", "desc"));

      const snapshot = await getDocs(q);
      const results: Flight[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as Omit<Flight, "id" | "user">;

        const userRef = doc(db, "users", data.userId);
        const userSnap = await getDoc(userRef);

        const user = {
          name: userSnap.exists() ? userSnap.data().name : "Unknown Pilot",
          photoURL: userSnap.exists() ? userSnap.data().photoURL ?? "" : "",
        };

        results.push({ id: docSnap.id, ...data, user });
      }

      setFlights(results);
    } catch (err) {
      console.error("Error loading flights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFlights();
    setRefreshing(false);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchFlights();
      setLoading(false);
    };
    load();
  }, [showOnlyMine]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading flights...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>🛫 Flight Feed</Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Button
          title={showOnlyMine ? "Show Global Feed" : "Show My Flights"}
          onPress={() => setShowOnlyMine((prev) => !prev)}
        />
      </View>

      <FlatList
        data={flights}
        keyExtractor={(item) => item.id}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/flight/${item.id}`)}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
              }}
            >
              {/* 👤 User Info Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Image
                  source={{ uri: item.user.photoURL }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                />
                <Text style={{ fontWeight: "bold" }}>
                  {item.user?.name || "Pilot"}
                </Text>
              </View>

              {/* 🛩 Flight Info */}
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {item.title}
              </Text>
              <Text style={{ color: "gray", marginBottom: 5 }}>
                {item.date.toDate().toLocaleDateString()}
              </Text>
              <Text>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
