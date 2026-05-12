import { View, Text, ScrollView, ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { getFavoritesApi, toggleFavoriteApi } from "../../Services/customerApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { useRefresh } from "../../reusable func/refreshContext";
import { NavigateTo } from "../../reusable func/navigateTo";
import { HallCard } from "../hallOwnerscrs/hallCard";
import { styles as s, styles } from "./ibrahimStyles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

export default function Favorites() {
  const { triggerRefresh } = useRefresh();

  const {
    items: favoriteHalls,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  } = usePaginatedFetch({
    fetchFunction: getFavoritesApi,
    limit: 10,
  });

  const handleToggleFavorite = async (hallId: number) => {
    try {
      await toggleFavoriteApi(hallId);
      triggerRefresh();
    } catch (err) { // [معدّل - كان error]
      console.error("Error toggling favorite:", err);
    }
  };

  const handleScrollEnd = ({ nativeEvent }: any) => {
    const isCloseToBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - 20;

    if (isCloseToBottom && hasMore && !loadingMore) {
      loadMore();
    }
  };

  const renderContent = () => {
    if (loading && favoriteHalls.length === 0) {
      return (
        <ActivityIndicator
          size="large"
          color="#6C4AB6"
          style={{ marginTop: 40 }}
        />
      );
    }

    if (favoriteHalls.length === 0) {
      return (
        <View style={s.emptyBox}>
          <Feather name="heart" size={56} color="#D4C4F7" />
          <Text style={s.emptyTitle}>لا يوجد مفضلات بعد</Text>
          <Text style={s.emptyText}>
            أضف صالات إلى قائمة المفضلة بالضغط على أيقونة القلب ❤️
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.body, { paddingHorizontal: 16 }]}
        onScroll={handleScrollEnd}
        scrollEventThrottle={400}
      >
        {favoriteHalls.map((hall: any) => (
          <HallCard
            key={hall.id}
            item={hall}
            isCustomer
            isFav
            onToggleFavorite={handleToggleFavorite}
            onPress={() => NavigateTo("HallDetails", { hall })}
          />
        ))}

        {loadingMore && (
          <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 10 }} />
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />
      <View
        style={[
          styles.info,
          {
            width: "90%",
            alignSelf: "center",
            alignItems: "center",
          },
        ]}
      >
      </View>
      <View style={{ flex: 1 }}>{renderContent()}</View>
    </SafeAreaView>
  );
}