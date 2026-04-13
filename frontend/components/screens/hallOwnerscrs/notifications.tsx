import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { getNotificationsApi } from "../../Services/notificationApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { formatDate } from "../../reusable func/formatDate";

interface Notification {
  id: number;
  title: string;
  content: string;
  notification_type: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

// Returns icon name + color based on notification_type
const getNotificationStyle = (type: string) => {
  switch (type) {
    case "booking":
      return { icon: "calendar" as const, color: "#22C55E", bg: "#F0FDF4" };
    case "cancel":
      return { icon: "close-circle" as const, color: "#EF4444", bg: "#FEF2F2" };
    case "service":
      return { icon: "sparkles" as const, color: "#6C4AB6", bg: "#F3EAFF" };
    case "reschedule":
      return {
        icon: "calendar-outline" as const,
        color: "#F59E0B",
        bg: "#FFFBEB",
      };
    default:
      return {
        icon: "notifications-outline" as const,
        color: "#6C4AB6",
        bg: "#F3EAFF",
      };
  }
};

export default function Notifications() {
  const {
    items: notifications,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    onRefresh,
    loadMore,
  } = usePaginatedFetch({
    fetchFunction: getNotificationsApi,
    limit: 10,
  });

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6C4AB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />

      <FlatList
        data={notifications as Notification[]}
        keyExtractor={(item) => item.id.toString()}
        style={[{ width: "90%" }]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C4AB6"]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: "60%" }}>
            <Ionicons name="notifications-off-outline" size={80} color="#DDD" />
            <Text style={styles.subtitle}>لا توجد اشعارات</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
          ) : !hasMore && notifications.length > 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "#AAA",
                marginVertical: 20,
                fontSize: 14,
              }}
            >
              لا توجد اشعارات إضافية
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const { icon, color } = getNotificationStyle(item.notification_type);
          return (
            <View style={styles.card}>
              {/* Icon badge */}
              <View style={styles.row}>
                <Ionicons name={icon} size={24} color={color} />

                <View style={styles.gapBetween} />

                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {item.title}
                </Text>
              </View>

              {/* Content */}

              <Text style={[styles.subtitle, { fontSize: 16, marginTop: 10 }]}>
                {item.content}
              </Text>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#F1F2F6",
                  marginTop: 10,
                }}
              />

              {/* Date */}
              <View
                style={[
                  styles.row,
                  { marginTop: 10, gap: 5, alignItems: "center" },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="#AAA"
                  style={{ gap: 5 }}
                />

                <Text style={{ fontSize: 12, color: "#AAA" }}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
