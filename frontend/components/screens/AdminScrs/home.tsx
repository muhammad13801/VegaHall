import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import { getAllUsers, updateUserStatus } from "../../Services/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");

  // جلب المستخدمين مع debounce على البحث
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsers(searchName);
      setUsers(data);
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchName]);

  // [معدّل - كان AI] تغيير اسم المتغير من delayDebounceFn → timer وتبسيط الكتابة
  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const isActive = currentStatus?.toLowerCase() === "active";
    const newStatus = isActive ? "suspended" : "active";
    const actionLabel = newStatus === "active" ? "تفعيل" : "إلغاء التفعيل";

    Alert.alert(
      "تأكيد الاختيار",
      `هل أنت متأكد من ${actionLabel} هذا الحساب؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "موافق",
          onPress: async () => {
            try {
              await updateUserStatus(userId, newStatus);
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === userId ? { ...u, status: newStatus } : u,
                ),
              );
            } catch (error) {
              Alert.alert("خطأ", "فشل في تحديث حالة المستخدم");
            }
          },
        },
      ],
    );
  };

  // [معدّل - كان AI] isCurrentlyActive → isActive، statusText → actionLabel
  const renderUser = ({ item }: { item: any }) => {
    const isActive = item.status?.toLowerCase() === "active";

    return (
      <View style={styles.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardText} numberOfLines={1}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={{ color: "#666", fontSize: 13, textAlign: "right" }}>
              {item.email}
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 5,
                alignItems: "center",
              }}
            >
              <View style={[styles.items, { marginLeft: 0, marginRight: 5 }]}>
                <Text style={styles.itemText}>
                  {item.role === "owner" ? "Hall Owner" : item.role}
                </Text>
              </View>
              <View
                style={[
                  styles.items,
                  {
                    backgroundColor: isActive ? "#E8F5E9" : "#FFEBEE",
                    marginRight: 5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: isActive ? "#2E7D32" : "#C62828" },
                  ]}
                >
                  {isActive ? "نشط" : "مجمد"}
                </Text>
              </View>
              {Number(item.owner_rating) > 0 && (
                <View style={[styles.items, { backgroundColor: "#FFFDE7" }]}>
                  <Text style={[styles.itemText, { color: "#FBC02D" }]}>
                    ⭐ {item.owner_rating}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleToggleStatus(item.id, item.status)}
            style={{ padding: 10 }}
          >
            <MaterialIcons
              name={isActive ? "block" : "check-circle"}
              size={28}
              color={isActive ? "#C62828" : "#2E7D32"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />
      <View
        style={[
          styles.info,
          { width: "95%", alignSelf: "center", justifyContent: "center" },
        ]}
      >
        <Text style={[styles.title, { textAlign: "center", width: "100%" }]}>
          إدارة المستخدمين
        </Text>
      </View>

      <View style={{ width: "90%", marginTop: 15 }}>
        <TextInput
          style={styles.input}
          placeholder="ابحث بالاسم..."
          value={searchName}
          onChangeText={setSearchName}
          textAlign="right"
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6C4AB6"
          style={{ flex: 1, marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 20 }}
          style={{ width: "100%" }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              لا يوجد مستخدمين حالياً
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
