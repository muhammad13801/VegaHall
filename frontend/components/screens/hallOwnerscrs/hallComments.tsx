import { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { getHallCommentsApi } from "../../Services/hallApi";
import { useRefresh } from "../../reusable func/refreshContext";
import Toast from "react-native-toast-message";

const StarRating = memo(({ rating }: { rating: number }) => (
  <View style={[styles.row, { gap: 2 }]}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={14}
        color="#FFC107"
      />
    ))}
  </View>
));

const CommentCard = memo(({ item }: { item: any }) => (
  <View style={[styles.card, { marginBottom: 12, gap: 8 }]}>
    <View style={[styles.info, { alignItems: "center" }]}>
      <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F3EAFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={20} color="#6C4AB6" />
        </View>
        <View>
          <Text style={styles.profileValue}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.profileLabel}>
            {new Date(item.created_at).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
      <StarRating rating={item.rating} />
    </View>
    <Text style={{ fontSize: 14, color: "#555", lineHeight: 22 }}>
      {item.comment}
    </Text>
  </View>
));

const EmptyComponent = (
  <View
    style={{ justifyContent: "center", alignItems: "center", marginTop: "70%" }}
  >
    <Ionicons name="chatbubble-outline" size={80} color="#DDD" />
    <Text style={styles.subtitle}>لا توجد تعليقات على هذه الصالة بعد</Text>
  </View>
);

const renderItem = ({ item }: { item: any }) => <CommentCard item={item} />;
const keyExtractor = (item: any) => item.id.toString();

export default function HallComments() {
  const route = useRoute<any>();
  const hallId = route.params?.hallId;
  const { refreshKey } = useRefresh();

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComments = useCallback(
    async (isRefresh = false) => {
      try {
        const { data } = await getHallCommentsApi(hallId);
        setComments(data);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: err.response?.data || "فشل تحميل التعليقات",
        });
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [hallId],
  );

  useEffect(() => {
    setLoading(true);
    fetchComments();
  }, [fetchComments, refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComments(true);
  }, [fetchComments]);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#6C4AB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />

      <FlatList
        data={comments}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={{ width: "90%", alignSelf: "center" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C4AB6"]}
          />
        }
        ListEmptyComponent={EmptyComponent}
      />
    </SafeAreaView>
  );
}
