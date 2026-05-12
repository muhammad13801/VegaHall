import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../styles";
import {
  NavigateAndReset,
  NavigateTo,
} from "../../../reusable func/navigateTo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useEffect, useState } from "react";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { getProfileApi, logoutApi } from "../../../Services/userApi";
import { InfoRow } from "../../../reusable func/infoRow";
export default function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfileApi();
      setUser(response.data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "حدث خطأ غير متوقع",
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          try {
            const sessionId = await AsyncStorage.getItem("sessionId");
            if (sessionId) {
              const response = await logoutApi();
              await AsyncStorage.removeItem("sessionId");
              Toast.show({ type: "success", text1: response?.data });
            }
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: err.response?.data || "حدث خطأ غير متوقع",
            });
          } finally {
            NavigateAndReset("Login");
          }
        },
      },
    ]);
  };

  const fullName = user ? `${user.first_name} ${user.last_name}` : "---";
  const roleLabel =
    user?.role === "owner"
      ? "مالك قاعة"
      : user?.role === "customer"
        ? "زبون"
        : "مدير النظام";

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />

      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <Ionicons name="person-circle" color="#6C4AB6" size={100} />
          </View>
          <Text style={[styles.title, { fontSize: 24 }]}>{fullName}</Text>
          <Text style={[styles.subtitle, { marginBottom: 0, fontSize: 14 }]}>
            {roleLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.info}
          onPress={() =>
            NavigateTo("UpdateName", {
              first_name: user?.first_name,
              last_name: user?.last_name,
            })
          }
        >
          <InfoRow
            icon="person-outline"
            label="الاسم الكامل"
            value={fullName}
            containerStyle={{ flex: 1 }}
          />
          <Ionicons name="chevron-back-outline" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.info}
          onPress={() => NavigateTo("UpdateEmail")}
        >
          <InfoRow
            icon="mail-outline"
            label="البريد الإلكتروني"
            value={user?.email || "---"}
            containerStyle={{ flex: 1 }}
          />
          <Ionicons name="chevron-back-outline" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.info}
          onPress={() => NavigateTo("UpdatePhone")}
        >
          <InfoRow
            icon="call-outline"
            label="رقم الهاتف"
            value={user?.phone_number || "---"}
            containerStyle={{ flex: 1 }}
          />
          <Ionicons name="chevron-back-outline" size={20} color="#CCC" />
        </TouchableOpacity>

        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={[styles.actionButton, styles.profileSecondaryAction]}
          onPress={() => NavigateTo("UpdatePassword")}
        >
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              style={styles.screenIcon}
            />
            <Text style={[styles.actionText, { fontSize: 16 }]}>
              {"تغيير كلمة المرور "}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 10 }} />

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: "#FFE5E5", borderWidth: 0 },
          ]}
          onPress={handleLogout}
        >
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="log-out-outline"
              size={20}
              style={[styles.screenIcon, { color: "#D9534F" }]}
            />
            <Text style={[styles.actionButtonText, { color: "#D9534F" }]}>
              تسجيل الخروج
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
