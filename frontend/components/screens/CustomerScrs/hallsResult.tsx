import { useState, useCallback, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { goBack, NavigateTo } from "../../reusable func/navigateTo";
import {
  searchApi,
  getFavoritesApi,
  toggleFavoriteApi,
} from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { HallCard } from "../hallOwnerscrs/hallCard";
import { styles as s } from "./ibrahimStyles";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";

type SortMode = "rating" | "price_low" | "price_high";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "rating", label: "التقييم" },
  { key: "price_low", label: "الأقل سعراً" },
  { key: "price_high", label: "الأعلى سعراً" },
];

export default function HallsResult({ route }: any) {
  const params = route?.params || {};
  const { refreshKey, triggerRefresh } = useRefresh();

  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [halls, setHalls] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sortHalls = (items: any[]) => {
    const sorted = [...items];

    if (sortMode === "rating") {
      return sorted.sort(
        (a, b) =>
          (b.average_rating || b.avg_rating || 0) -
          (a.average_rating || a.avg_rating || 0),
      );
    }

    if (sortMode === "price_low") {
      return sorted.sort((a, b) => a.base_price - b.base_price);
    }

    return sorted.sort((a, b) => b.base_price - a.base_price);
  };

  const fetchFavorites = async () => {
    const favRes = await getFavoritesApi(1, 100);
    setFavoriteIds(new Set(favRes.data.map((fav: any) => fav.id)));
  };

  const fetchHalls = async () => {
    const res = await searchApi({
      query: params.query || "",
      cities: params.cities || [],
      service: params.services?.[0],
      minPrice: params.minPrice || "",
      maxPrice: params.maxPrice || "",
      date: params.date ? params.date.split("T")[0] : null,
    });

    setHalls(sortHalls(res.data));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchFavorites();
      await fetchHalls();
    } catch (err) { // [معدّل - كان error]
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params, sortMode]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleFavorite = async (hallId: number) => {
    try {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(hallId) ? next.delete(hallId) : next.add(hallId);
        return next;
      });

      await toggleFavoriteApi(hallId);
      triggerRefresh();
    } catch (err) { // [معدّل]
      console.error("Toggle favorite error:", err);
      loadData();
    }
  };

  const renderHall = ({ item }: any) => (
    <HallCard
      item={item}
      isCustomer
      isFav={favoriteIds.has(item.id)}
      onToggleFavorite={handleToggleFavorite}
      onPress={() => NavigateTo("HallDetails", { hall: item })}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { justifyContent: "flex-start" }]}>
      <BackgroundDecoration />

      {/* Header */}
      <View
        style={[
          styles.info,
          {
            width: "90%",
            alignSelf: "center",
            marginTop: 30,
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.title, { fontSize: 28, lineHeight: 35 }]}>
          نتائج البحث
        </Text>

        <View style={{ marginBottom: -5, transform: [{ scaleX: -1 }] }}>
          <BackButton />
        </View>
      </View>

      {/* Sort */}
      <View style={s.sortContainer}>
        <Text style={s.ctaLabel}>ترتيب حسب:</Text>

        <View style={s.sortOptions}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                s.sortChip,
                sortMode === option.key && s.checkboxBoxActive,
              ]}
              onPress={() => setSortMode(option.key)}
            >
              <Text
                style={[
                  s.sortChipText,
                  sortMode === option.key && s.serviceChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading && halls.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#6C4AB6"
          style={{ marginTop: 40 }}
        />
      ) : halls.length > 0 ? (
        <FlatList
          data={halls}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHall}
          contentContainerStyle={s.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6C4AB6"]}
            />
          }
        />
      ) : (
        <View style={s.emptyContainer}>
          <MaterialCommunityIcons
            name="magnify-close"
            size={64}
            color="#D4C4F7"
            style={s.resultEmptyIcon}
          />

          <Text style={s.emptyTitle}>لا توجد نتائج</Text>

          <Text style={s.resultEmptySubtitle}>
            جرب تعديل الفلاتر أو البحث باسم مختلف
          </Text>

          <TouchableOpacity style={s.resultEmptyButton} onPress={goBack}>
            <Text style={s.resultEmptyButtonText}>تعديل البحث</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}