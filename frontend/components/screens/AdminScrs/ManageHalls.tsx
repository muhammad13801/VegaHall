import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import { getAdminHalls, approveHall } from "../../Services/adminApi";

// بطاقة القاعة — مفصولة زي ما المالك يعمل في BookingCard
const HallCard = ({
  item,
  onApprove,
}: {
  item: any;
  onApprove: () => void;
}) => {
  const isActive = item.status?.toLowerCase() === "active";

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardText}>{item.hall_name}</Text>
          <Text style={{ color: "#666", fontSize: 13, textAlign: "right" }}>
            {item.city} - {item.location}
          </Text>

          {/* الحالة + التقييم */}
          <View style={{ flexDirection: "row", marginTop: 5, justifyContent: "flex-end" }}>
            <View
              style={[
                styles.items,
                { backgroundColor: isActive ? "#E8F5E9" : "#FFF3E0" },
              ]}
            >
              <Text style={[styles.itemText, { color: isActive ? "#2E7D32" : "#EF6C00" }]}>
                {isActive ? "نشطة" : "قيد الانتظار"}
              </Text>
            </View>
            {item.avg_rating > 0 && (
              <View style={[styles.items, { marginLeft: 5, backgroundColor: "#FFFDE7" }]}>
                <Text style={[styles.itemText, { color: "#FBC02D" }]}>⭐ {item.avg_rating}</Text>
              </View>
            )}
          </View>
        </View>

        {/* زر الموافقة — يظهر فقط للطلبات المعلقة */}
        {item.status?.toLowerCase() === "pending" && (
          <TouchableOpacity
            onPress={onApprove}
            style={{ marginLeft: 15, justifyContent: "center" }}
          >
            <MaterialIcons name="check-circle" size={32} color="#2E7D32" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function ManageHalls() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchRating, setSearchRating] = useState("");

  const fetchHalls = async () => {
    try {
      const { data } = await getAdminHalls(searchName, searchRating);
      setHalls(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "فشل في جلب قائمة القاعات",
      });
    } finally {
      setLoading(false);
    }
  };

  // debounce على البحث — 500ms كافية
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHalls();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchName, searchRating]);

  const handleApprove = async (hallId: number) => {
    try {
      const { data } = await approveHall(hallId);
      Toast.show({ type: "success", text1: data || "تمت الموافقة على القاعة بنجاح" });
      fetchHalls();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "فشل في الموافقة على القاعة",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />

      <View style={[styles.info, { width: "90%", alignSelf: "center", marginBottom: 15 }]}>
        <Text style={styles.title}>إدارة القاعات</Text>
        <BackButton />
      </View>

      {/* حقول البحث */}
      <View style={{ width: "90%", alignSelf: "center", marginBottom: 10 }}>
        <TextInput
          style={styles.input}
          placeholder="ابحث عن اسم القاعة..."
          value={searchName}
          onChangeText={setSearchName}
          textAlign="right"
        />
        <TextInput
          style={[styles.input, { marginTop: 5 }]}
          placeholder="الحد الأدنى للتقييم..."
          value={searchRating}
          onChangeText={setSearchRating}
          keyboardType="numeric"
          textAlign="right"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C4AB6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={halls}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HallCard item={item} onApprove={() => handleApprove(item.id)} />
          )}
          contentContainerStyle={{ padding: 20 }}
          style={{ width: "100%" }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              لا توجد قاعات مطابقة للبحث
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
