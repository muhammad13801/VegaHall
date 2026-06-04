import React, { memo } from "react";
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
}

const NOTIFICATION_STYLES: Record<
  string,
  { icon: any; color: string; bg: string }
> = {
  booking: { icon: "calendar", color: "#22C55E", bg: "#F0FDF4" },

  meal_approved: { icon: "checkmark-circle", color: "#22C55E", bg: "#F0FDF4" },
  meal_rejected: { icon: "close-circle", color: "#EF4444", bg: "#FEF2F2" },

  service_approved: {
    icon: "checkmark-circle",
    color: "#22C55E",
    bg: "#F0FDF4",
  },
  service_rejected: { icon: "close-circle", color: "#EF4444", bg: "#FEF2F2" },

  reschedule_request: { icon: "time-outline", color: "#F59E0B", bg: "#FFFBEB" },
  reschedule_reject: { icon: "close-circle", color: "#EF4444", bg: "#FEF2F2" },

  hall_review: { icon: "building", color: "#3B82F6", bg: "#EFF6FF" },
  hall_approved: { icon: "checkmark-circle", color: "#22C55E", bg: "#F0FDF4" },
  hall_rejected: { icon: "close-circle", color: "#EF4444", bg: "#FEF2F2" },

  default: { icon: "notifications-outline", color: "#6C4AB6", bg: "#F3EAFF" },
};
const NotificationCard = memo(({ item }: { item: Notification }) => {
  const style =
    NOTIFICATION_STYLES[item.notification_type] || NOTIFICATION_STYLES.default;

  return (
    <View style={styles.card}>
      <View style={[styles.row, { alignItems: "center" }]}>
        <View
          style={[
            styles.profileAvatarSmall,
            {
              backgroundColor: style.bg,
              width: 44,
              height: 44,
              borderRadius: 12,
            },
          ]}
        >
          <Ionicons name={style.icon} size={24} color={style.color} />
        </View>
        <View style={styles.gapBetween} />
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#AAA",
              marginTop: 2,
            }}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.subtitle,
          {
            fontSize: 15,
            marginTop: 12,
            lineHeight: 20,
            color: "#555",
          },
        ]}
      >
        {item.content}
      </Text>
    </View>
  );
});

export default function Notifications() {
  const {
    items,
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

  if (loading && items.length === 0) {
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
        data={items as Notification[]}
        keyExtractor={(item) => item.id.toString()}
        style={{ width: "90%" }}
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
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#DDD" />
            <Text style={styles.subtitle}>لا توجد اشعارات</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
          ) : !hasMore && items.length > 0 ? (
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
        renderItem={({ item }) => <NotificationCard item={item} />}
      />
    </SafeAreaView>
  );
}
