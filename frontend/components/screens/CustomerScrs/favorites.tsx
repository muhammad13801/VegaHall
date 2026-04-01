import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFavoritesApi, toggleFavoriteApi } from "../../Services/customerApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { useRefresh } from "../../reusable func/refreshContext";
import { NavigateTo } from "../../reusable func/navigateTo";

import { HallCard } from "../hallOwnerscrs/hallCard";
import { styles as s, styles } from "./ibrahimStyles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";

export default function Favorites({ onOpenDrawer }: { onOpenDrawer?: () => void }) {
    const { triggerRefresh } = useRefresh();

    const {
        items: favoriteHalls,
        loading,
        loadingMore,
        hasMore,
        loadMore
    } = usePaginatedFetch({
        fetchFunction: getFavoritesApi,
        limit: 10,
    });

    const handleToggleFavorite = async (hallId: number) => {
        try {
            await toggleFavoriteApi(hallId);
            triggerRefresh(); // Refresh lists across the app to reflect changes
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <BackgroundDecoration />
            <View style={[styles.info,{width:"90%",marginVertical:5 }]}>
                <Text style={[styles.title,]}>المفضلة</Text>
                <BackButton/>
            </View>

            <View style={{ flex: 1 }}>
                {loading && favoriteHalls.length === 0 ? (
                    <ActivityIndicator size="large" color="#6C4AB6" style={{ marginTop: 40 }} />
                ) : favoriteHalls.length === 0 ? (
                    <View style={s.emptyBox}>
                        <Feather name="heart" size={56} color="#D4C4F7" />
                        <Text style={s.emptyTitle}>لا يوجد مفضلات بعد</Text>
                        <Text style={s.emptyText}>
                            أضف صالات إلى قائمة المفضلة بالضغط على أيقونة القلب ❤️
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[s.body, { paddingHorizontal: 16 }]}
                        onScroll={({ nativeEvent }) => {
                            const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 20;
                            if (isCloseToBottom && hasMore && !loadingMore) {
                                loadMore();
                            }
                        }}
                        scrollEventThrottle={400}
                    >
                        {favoriteHalls.map((hall: any) => (
                            <HallCard
                                key={hall.id}
                                item={hall}
                                isCustomer={true}
                                isFav={true}
                                onToggleFavorite={(id: number) => handleToggleFavorite(id)}
                                onPress={() => NavigateTo("HallDetails", { hall })}
                            />
                        ))}

                        {loadingMore && (
                            <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 10 }} />
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView >
    );
}