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
import { formatDate } from "../../reusable func/formatDate";
import { InfoRow } from "../../reusable func/infoRow";

const StarRating = memo(({ rating }: { rating: number }) => (
  <View style={[styles.row, { gap: 2 }]}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Ionicons
        key={s}
        name={s <= rating ? "star" : "star-outline"}
        size={14}
        color="#FFC107"
      />
    ))}
  </View>
));

const CommentCard = memo(({ item }: { item: any }) => (
  <View style={[styles.card, { marginBottom: 12, gap: 8 }]}>
    <View style={[styles.info, { alignItems: "center" }]}>
      <InfoRow
        icon="person"
        label={`${item.first_name} ${item.last_name}`}
        value={formatDate(item.created_at)}
        containerStyle={{ paddingVertical: 0, flex: 1 }}
      />
      <StarRating rating={item.rating} />
    </View>
    <Text style={styles.commentBody}>{item.comment}</Text>
  </View>
));

const EmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="chatbubble-outline" size={80} color="#DDD" />
    <Text style={styles.subtitle}>لا توجد تعليقات على هذه الصالة بعد</Text>
  </View>
);

export default function HallComments() {
  const { params } = useRoute<any>();
  const { refreshKey } = useRefresh();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComments = useCallback(
    async (isRefresh = false) => {
      try {
        const { data } = await getHallCommentsApi(params?.hallId);
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
    [params?.hallId],
  );

  useEffect(() => {
    setLoading(true);
    fetchComments();
  }, [fetchComments, refreshKey]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.justifyCenter]}>
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CommentCard item={item} />}
        style={{ width: "90%", alignSelf: "center" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchComments(true);
            }}
            colors={["#6C4AB6"]}
          />
        }
        ListEmptyComponent={<EmptyComponent />}
      />
    </SafeAreaView>
  );
}
