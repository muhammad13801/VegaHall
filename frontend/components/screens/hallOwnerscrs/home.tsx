import React from "react";
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { getOwnerHallsApi } from "../../Services/hallApi";
import { HallCard } from "./hallCard";
import { Ionicons } from "@expo/vector-icons";
import { NavigateTo } from "../../reusable func/navigateTo";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { SafeAreaView } from "react-native-safe-area-context";

const EmptyList = React.memo(() => (
  <View style={{ alignItems: "center", marginTop: "70%" }}>
    <Ionicons name="business-outline" size={80} color="#DDD" />
    <Text style={styles.subtitle}>لا توجد صالات مضافة حالياً</Text>
  </View>
));

const FooterList = React.memo(
  ({
    loadingMore,
    hasMore,
    count,
  }: {
    loadingMore: boolean;
    hasMore: boolean;
    count: number;
  }) => {
    if (loadingMore) {
      return (
        <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
      );
    }
    if (!hasMore && count > 0) {
      return (
        <Text
          style={{
            textAlign: "center",
            color: "#AAA",
            marginVertical: 20,
            fontSize: 14,
          }}
        >
          لا توجد صالات إضافية
        </Text>
      );
    }
    return null;
  },
);

export default function Home() {
  const {
    items: halls,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    onRefresh,
    loadMore,
  } = usePaginatedFetch({
    fetchFunction: getOwnerHallsApi,
    limit: 5,
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />

      {/* Header + Add Hall Button */}
      <View style={[styles.info, { width: "90%" }]}>
        <Text style={styles.title}>صالاتي</Text>
        <TouchableOpacity
          style={[styles.actionButton, { width: 110, marginTop: 0 }]}
          onPress={() => NavigateTo("AddHall")}
        >
          <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={[styles.actionButtonText, { fontSize: 14 }]}>
              أضف صالة
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Halls List */}
      {loading && halls.length === 0 ? (
        <ActivityIndicator size="large" color="#6C4AB6" style={{ flex: 1 }} />
      ) : (
        <FlatList
          style={{ width: "90%" }}
          data={halls}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HallCard
              item={item}
              onPress={(id: number) => NavigateTo("HallDetail", { hallId: id })}
            />
          )}
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
          ListEmptyComponent={<EmptyList />}
          ListFooterComponent={
            <FooterList
              loadingMore={loadingMore}
              hasMore={hasMore}
              count={halls.length}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={5}
          windowSize={5}
          maxToRenderPerBatch={5}
        />
      )}
    </SafeAreaView>
  );
}
