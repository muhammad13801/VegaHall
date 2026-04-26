import { useState, useCallback, useEffect } from "react";
import { Text, TouchableOpacity, View, FlatList,ActivityIndicator, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBack, NavigateTo } from "../../reusable func/navigateTo";
import { styles as s } from "./ibrahimStyles";
import { searchApi, getFavoritesApi, toggleFavoriteApi } from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { HallCard } from "../hallOwnerscrs/hallCard";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";

type SortMode = "rating" | "price_low" | "price_high";

export default function HallsResult({ route }: any) {
    const params = route?.params || {};
    const { refreshKey, triggerRefresh } = useRefresh();
    const [sortMode, setSortMode] = useState<SortMode>("rating");

    const queryParam = params.query || "";
    const cityParam = params.city || "";
    const servicesParam = params.services || [];
    const minPriceParam = params.minPrice || "";
    const maxPriceParam = params.maxPrice || "";
    const dateParam = params.date || null;

    const [halls, setHalls] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const performSearchAndFetchFavorites = useCallback(async () => {
        setLoading(true);
        try {
            const favRes = await getFavoritesApi(1, 100);
            const userFavIds = new Set<number>(favRes.data.map((fav: any) => fav.id));
            setFavoriteIds(userFavIds);

            const res = await searchApi({
                query: queryParam,
                city: cityParam,
                service: servicesParam[0],
                minPrice: minPriceParam,
                maxPrice: maxPriceParam,
                date: dateParam ? dateParam.split('T')[0] : null,
            });

            let results = res.data;

            switch (sortMode) {
                case "rating":
                    results.sort((a: any, b: any) => ((b.average_rating || b.avg_rating || 0) - (a.average_rating || a.avg_rating || 0)));
                    break;
                case "price_low":
                    results.sort((a: any, b: any) => a.base_price - b.base_price);
                    break;
                case "price_high":
                    results.sort((a: any, b: any) => b.base_price - a.base_price);
                    break;
            }
            setHalls(results);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [queryParam, cityParam, servicesParam, sortMode]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        performSearchAndFetchFavorites();
    }, [performSearchAndFetchFavorites]);

    useEffect(() => {
        performSearchAndFetchFavorites();
    }, [performSearchAndFetchFavorites, refreshKey]);

    const handleToggleFavorite = async (hallId: number) => {
        try {
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (next.has(hallId)) next.delete(hallId);
                else next.add(hallId);
                return next;
            });
            await toggleFavoriteApi(hallId);
            triggerRefresh();
        } catch (error) {
            console.error("Toggle favorite error:", error);
            performSearchAndFetchFavorites();
        }
    };

    const activeFilters: string[] = [];

    return (
        <SafeAreaView style={styles.container}>
            <BackgroundDecoration />
            <View style={[styles.info, { width: "90%", alignSelf: "center", marginTop: 30, alignItems: 'center' }]}>
                <Text style={[styles.title, { fontSize: 28, lineHeight: 35 }]}>نتائج البحث</Text>
                <View style={{ marginBottom: -5, transform: [{ scaleX: -1 }] }}>
                    <BackButton />
                </View>
            </View>


            {activeFilters.length > 0 && (
                <View style={s.filterSummaryContainer}>
                    {activeFilters.map((f, i) => (
                        <View key={i} style={s.filterSummaryChip}>
                            <Text style={s.filterSummaryText}>{f}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={s.sortContainer}>
                <Text style={[s.ctaLabel]}>ترتيب حسب:</Text>
                <View style={s.sortOptions}>
                    {[
                        { key: "rating" as SortMode, label: "التقييم" },
                        { key: "price_low" as SortMode, label: "الأقل سعراً" },
                        { key: "price_high" as SortMode, label: "الأعلى سعراً" },
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[s.sortChip, sortMode === opt.key && s.checkboxBoxActive]}
                            onPress={() => setSortMode(opt.key)}
                        >
                            <Text style={[s.sortChipText, sortMode === opt.key && s.serviceChipTextActive]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading && halls.length === 0 ? (
                <ActivityIndicator size="large" color="#6C4AB6" style={{ marginTop: 40 }} />
            ) : halls.length > 0 ? (
                <FlatList
                    data={halls}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <HallCard
                            item={item}
                            isCustomer={true}
                            isFav={favoriteIds.has(item.id)}
                            onToggleFavorite={(id: number) => handleToggleFavorite(id)}
                            onPress={() => NavigateTo("HallDetails", { hall: item })}
                        />
                    )}
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
                    <MaterialCommunityIcons name="magnify-close" size={64} color="#D4C4F7" style={s.resultEmptyIcon} />
                    <Text style={s.emptyTitle}>لا توجد نتائج</Text>
                    <Text style={s.resultEmptySubtitle}>جرب تعديل الفلاتر أو البحث باسم مختلف</Text>
                    <TouchableOpacity style={s.resultEmptyButton} onPress={goBack}>
                        <Text style={s.resultEmptyButtonText}>تعديل البحث</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}