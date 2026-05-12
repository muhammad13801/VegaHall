import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import { getAllUsers, updateUserStatus } from "../../Services/adminApi";

// بطاقة المستخدم — مفصولة بره عشان أنظف
const UserCard = ({
  item,
  onToggle,
}: {
  item: any;
  onToggle: () => void;
}) => {
  const isActive = item.status?.toLowerCase() === "active";

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardText} numberOfLines={1}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={{ color: "#666", fontSize: 13, textAlign: "right" }}>{item.email}</Text>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={[styles.items, { marginLeft: 0, marginRight: 5 }]}>
              <Text style={styles.itemText}>{item.role}</Text>
            </View>
            <View
              style={[
                styles.items,
                { backgroundColor: isActive ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              <Text style={[styles.itemText, { color: isActive ? "#2E7D32" : "#C62828" }]}>
                {isActive ? "نشط" : "مجمد"}
              </Text>
            </View>
          </View>
        </View>

        {/* زر التفعيل/التجميد */}
        <TouchableOpacity onPress={onToggle} style={{ padding: 10 }}>
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

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في جلب قائمة المستخدمين" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const isActive = currentStatus?.toLowerCase() === "active";
    const newStatus = isActive ? "suspended" : "active";
    const actionLabel = newStatus === "active" ? "تفعيل" : "تجميد";

    Alert.alert(
      "تأكيد الاختيار",
      `هل أنت متأكد من ${actionLabel} هذا الحساب؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "موافق",
          onPress: async () => {
            try {
              const { data } = await updateUserStatus(userId, newStatus);
              setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
              );
              Toast.show({ type: "success", text1: data || "تم تحديث حالة المستخدم" });
            } catch (err: any) {
              Toast.show({ type: "error", text1: err.response?.data || "فشل في تحديث حالة المستخدم" });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />
      <View style={[styles.info, { width: "90%", marginRight: 5 }]}>
        <Text style={styles.title}>إدارة المستخدمين</Text>
        <BackButton />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C4AB6" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserCard item={item} onToggle={() => handleToggleStatus(item.id, item.status)} />
          )}
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
