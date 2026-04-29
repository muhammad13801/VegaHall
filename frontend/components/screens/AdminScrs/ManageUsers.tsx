import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import { getAllUsers, updateUserStatus } from "../../Services/adminApi";
import BackButton from "../../reusable func/backButton";
import { MaterialIcons } from "@expo/vector-icons";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "فشل في جلب قائمة المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Frozen" : "Active";
    const actionLabel = newStatus === "Active" ? "تفعيل" : "تجميد";

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

  // [معدّل - كان AI] كان arrow function inline — حوّلناه لصيغة منفصلة مثل المالك
  const renderUser = ({ item }: { item: any }) => (
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
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={[styles.items, { marginLeft: 0, marginRight: 5 }]}>
              <Text style={styles.itemText}>{item.role}</Text>
            </View>
            <View
              style={[
                styles.items,
                {
                  backgroundColor:
                    item.status === "Active" ? "#E8F5E9" : "#FFEBEE",
                },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  { color: item.status === "Active" ? "#2E7D32" : "#C62828" },
                ]}
              >
                {item.status === "Active" ? "نشط" : "مجمد"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleToggleStatus(item.id, item.status)}
          style={{ padding: 10 }}
        >
          <MaterialIcons
            name={item.status === "Active" ? "block" : "check-circle"}
            size={28}
            color={item.status === "Active" ? "#C62828" : "#2E7D32"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

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
