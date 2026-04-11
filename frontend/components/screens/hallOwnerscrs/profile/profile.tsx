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
        text1: err.response?.data,
        visibilityTime: 3000,
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
            Toast.show({ type: "error", text1: err.response?.data });
          } finally {
            NavigateAndReset("Login");
          }
        },
      },
    ]);
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <View style={styles.profileInfoRow}>
      <View style={styles.profileInfoIcon}>
        <Ionicons name={icon} size={24} color="#6C4AB6" />
      </View>
      <View style={styles.profileTextContainer}>
        <Text style={styles.profileLabel}>{label}</Text>
        <Text style={styles.profileValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-back-outline" size={20} color="#CCC" />
    </View>
  );

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
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => NavigateTo("UpdateEmail")}>
          <InfoRow
            icon="mail-outline"
            label="البريد الإلكتروني"
            value={user?.email || "---"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => NavigateTo("UpdatePhone")}>
          <InfoRow
            icon="call-outline"
            label="رقم الهاتف"
            value={user?.phone_number || "---"}
          />
        </TouchableOpacity>

        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#6C4AB6",
            },
          ]}
          onPress={() => NavigateTo("UpdatePassword")}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#6C4AB6"
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: "#6C4AB6", width: "40%" },
              ]}
            >
              تغيير كلمة المرور
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
              style={[styles.screenIcon, { marginLeft: 6, color: "#D9534F" }]}
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
