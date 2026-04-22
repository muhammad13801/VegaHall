import { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, ScrollView, StatusBar, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Linking, ImageBackground, Image, ActivityIndicator, RefreshControl } from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { goBack, NavigateTo } from "../../reusable func/navigateTo";
import { styles as s } from "./ibrahimStyles";
import { getHallByIdApi, getHallRatingsApi, getFavoritesApi, toggleFavoriteApi } from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { VideoCard } from "../../reusable func/videoCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HallDetails({ route }: any) {
    const initialHall = route?.params?.hall;
    const [hall, setHall] = useState<any>(initialHall);
    const [loading, setLoading] = useState(!initialHall);
    const [refreshing, setRefreshing] = useState(false);
    const [isFav, setIsFav] = useState(false);
    const { triggerRefresh } = useRefresh();
    const [activeSlide, setActiveSlide] = useState(0);
    const [reviews, setReviews] = useState<any[]>([]);

    const fetchDetails = async () => {
        if (!hall?.id) return;
        setLoading(true);
        try {
            const res = await getHallByIdApi(hall.id);
            setHall(res.data);

            const ratingsRes = await getHallRatingsApi(hall.id);
            setReviews(ratingsRes.data);

            const favRes = await getFavoritesApi(1, 100);
            const userFavIds = new Set<number>(favRes.data.map((f: any) => f.id));
            setIsFav(userFavIds.has(hall.id));
        } catch (error) {
            console.error("Failed to fetch hall details:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDetails();
    };

    useEffect(() => {
        fetchDetails();
    }, [initialHall?.id]);

    const handleToggleFavorite = async () => {
        if (!hall?.id) return;
        try {
            setIsFav(!isFav);
            await toggleFavoriteApi(hall.id);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            setIsFav(isFav);
        }
    };

    if (!hall && loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F8FC" }}>
                <ActivityIndicator size="large" color="#6C4AB6" />
                <Text style={{ marginTop: 12, color: "#6C4AB6", fontWeight: "600" }}>جاري تحميل التفاصيل...</Text>
            </View>
        );
    }

    if (!hall) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>لا توجد بيانات</Text>
            </View>
        );
    }

    const onGalleryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setActiveSlide(index);
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Feather
                    key={i}
                    name="star"
                    size={14}
                    color={i <= rating ? "#F4B400" : "#E0E0E0"}
                />
            );
        }
        return stars;
    };

    const images: string[] = hall.images || [];
    const videos: string[] = hall.videos || [];
    const media = [
        ...images.map((uri) => ({ type: "image", uri })),
        ...videos.map((uri) => ({ type: "video", uri })),
    ];

    return (
        <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor="#5B3A9E" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={true}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#6C4AB6"]}
                    />
                }
            >
                <View style={s.galleryContainer}>
                    {media.length > 0 ? (
                        <FlatList
                            data={media}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onGalleryScroll}
                            scrollEventThrottle={16}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item }) =>
                                item.type === "image" ? (
                                    <View style={{ width: SCREEN_WIDTH, height: "100%" }}>
                                        <ImageBackground
                                            source={{ uri: item.uri }}
                                            style={{ position: "absolute", width: "100%", height: "100%" }}
                                            resizeMode="cover"
                                            blurRadius={15}
                                        />
                                        <Image
                                            source={{ uri: item.uri }}
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                ) : (
                                    <View style={{ width: SCREEN_WIDTH, height: "100%", backgroundColor: "#000" }}>
                                        <VideoCard uri={item.uri} width={SCREEN_WIDTH} />
                                    </View>
                                )
                            }
                        />
                    ) : (
                        <View style={[s.gallerySlide, { backgroundColor: "#ECE9F1" }]}>
                            <MaterialCommunityIcons name="office-building" size={64} color="#B0A4C8" />
                        </View>
                    )}
                    <View style={s.galleryOverlay} pointerEvents="none" />

                    <SafeAreaView edges={["top"]} style={s.galleryTopBar}>
                        <View style={s.galleryBtnRight}>
                            <TouchableOpacity
                                style={s.galleryBtn}
                                onPress={handleToggleFavorite}
                            >
                                <Feather name="heart" size={20} color={isFav ? "#E74C3C" : "#FFF"} />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.galleryBtn}>
                                <Feather name="share-2" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={s.galleryBtn} onPress={goBack}>
                            <Feather name="arrow-left" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {media.length > 0 && (
                        <View style={s.galleryIndicatorRow}>
                            <View style={s.galleryDotsWrap}>
                                {media.map((_, i) => (
                                    <View key={i} style={[s.galleryDot, activeSlide === i && s.galleryDotActive]} />
                                ))}
                            </View>
                            <View style={s.galleryCountBadge}>
                                <Text style={s.galleryCountText}>
                                    {activeSlide + 1} / {media.length}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={s.contentBody}>
                    <View style={s.titleSection}>
                        <View style={s.titleRow}>
                            <Text style={s.hallName}>{hall.hall_name || hall.name}</Text>
                            <View style={s.priceBox}>
                                <Text style={s.priceText}>
                                    {(hall.base_price || 0).toLocaleString()} <Text style={s.currency}>₪</Text>
                                </Text>
                                <Text style={s.priceLabel}>يبدأ من</Text>
                            </View>
                        </View>

                        <View style={[s.infoChipsRow]}>
                            <TouchableOpacity 
                                style={[s.infoChip, { flex: 1, justifyContent: "flex-start" }]}
                                onPress={() => {
                                    const query = hall.location || `${hall.city} ${hall.address}`;
                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
                                }}
                                activeOpacity={0.7}
                            >
                                <Feather name="map-pin" size={15} color="#6C4AB6" />
                                <Text style={[s.costLabel, { flex: 1, textAlign: "left" }]}>
                                    {hall.city} {hall.address ? `- ${hall.address}` : ""}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[s.infoChipsRow, { justifyContent: "space-between", alignItems: "center", marginTop: 8 }]}>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <View style={s.infoChip}>
                                    <Feather name="star" size={15} color="#F4B400" />
                                    <Text style={s.ratingChipText}>{Number(hall.average_rating || hall.rating || 0).toFixed(1)}</Text>
                                    <Text style={s.reviewsText}>({hall.reviews_count || hall.reviewsCount || 0} تقييم)</Text>
                                </View>
                            </View>
                            
                            {hall.location && (
                                <TouchableOpacity 
                                    style={[s.infoChip, { backgroundColor: "#E8DEFF" }]}
                                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${hall.location}`)}
                                >
                                    <MaterialCommunityIcons name="google-maps" size={18} color="#6C4AB6" />
                                    <Text style={[s.costLabel, { color: "#6C4AB6", fontWeight: "bold" }]}>عرض الخريطة</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={s.card}>
                        <Text style={s.sectionTitle}>عن الصالة</Text>
                        <Text style={s.descriptionText}>{hall.description}</Text>
                    </View>

                    <View style={s.card}>
                        <Text style={s.sectionTitle}>معلومات الصالة</Text>
                        <View style={s.infoGrid}>
                            <View style={s.infoGridItem}>
                                <View style={s.infoGridIcon}>
                                    <Feather name="users" size={20} color="#6C4AB6" />
                                </View>
                                <Text style={s.infoGridValue}>{hall.capacity || 0}</Text>
                                <Text style={s.infoGridLabel}>سعة الأشخاص</Text>
                            </View>
                            <View style={s.infoGridItem}>
                                <View style={s.infoGridIcon}>
                                    <Feather name="star" size={20} color="#6C4AB6" />
                                </View>
                                <Text style={s.infoGridValue}>{Number(hall.average_rating || hall.rating || 0).toFixed(1)}</Text>
                                <Text style={s.infoGridLabel}>التقييم</Text>
                            </View>
                            <View style={s.infoGridItem}>
                                <View style={s.infoGridIcon}>
                                    <Feather name="grid" size={20} color="#6C4AB6" />
                                </View>
                                <Text style={s.infoGridValue}>{hall.services?.length || 0}</Text>
                                <Text style={s.infoGridLabel}>خدمات متوفرة</Text>
                            </View>
                        </View>
                    </View>

                    {hall.meal_options && hall.meal_options.length > 0 && (
                        <View style={s.card}>
                            <Text style={s.sectionTitle}>خيارات الطعام والوجبات</Text>
                            <View style={{ gap: 10, marginTop: 5 }}>
                                {hall.meal_options.map((meal: any, idx: number) => (
                                    <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F7F8FC", padding: 12, borderRadius: 12 }}>
                                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            <View style={{ backgroundColor: "#E8DEFF", padding: 8, borderRadius: 10 }}>
                                                <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#6C4AB6" />
                                            </View>
                                            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>{meal.name}</Text>
                                        </View>
                                        <Text style={{ fontSize: 16, fontWeight: "700", color: "#6C4AB6" }}>{meal.price_per_person} ₪ <Text style={{ fontSize: 12, color: "#666", fontWeight: "400" }}>/ شخص</Text></Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {hall.services && hall.services.length > 0 && (
                        <View style={s.card}>
                            <Text style={s.sectionTitle}>الخدمات المتوفرة (اختيارية)</Text>
                            <View style={{ gap: 10, marginTop: 5 }}>
                                {hall.services.map((svc: any) => {
                                    const svcName = typeof svc === 'string' ? svc : svc.name;
                                    const svcPrice = typeof svc === 'object' && svc.price ? svc.price : 0;
                                    return (
                                        <View key={svcName} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: "#EEE", paddingBottom: 10 }}>
                                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                                <View style={s.serviceIconCircle}>
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={16}
                                                        color="#FFF"
                                                    />
                                                </View>
                                                <Text style={{ fontSize: 15, fontWeight: "500", color: "#333" }}>{svcName}</Text>
                                            </View>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: "#4CAF50" }}>
                                                {svcPrice > 0 ? `+${svcPrice} ₪` : "مشمول مجاناً"}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {hall.secondary_contacts && hall.secondary_contacts.length > 0 && (
                        <View style={s.card}>
                            <Text style={s.sectionTitle}>جهات اتصال إضافية (للتواصل السريع)</Text>
                            <View style={{ gap: 10, marginTop: 5 }}>
                                {hall.secondary_contacts.map((contact: any, idx: number) => (
                                    <TouchableOpacity 
                                        key={idx} 
                                        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F7F8FC", padding: 12, borderRadius: 12 }}
                                        onPress={() => Linking.openURL(`tel:${contact.phone_number}`)}
                                    >
                                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            <View style={{ backgroundColor: "#E8DEFF", padding: 8, borderRadius: 10 }}>
                                                <Feather name="phone-call" size={18} color="#6C4AB6" />
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 15, fontWeight: "600", color: "#333" }}>{contact.first_name || contact.name}</Text>
                                                <Text style={{ fontSize: 13, color: "#666", marginTop: 2, textAlign: "left" }}>{contact.phone_number}</Text>
                                            </View>
                                        </View>
                                        <Feather name="arrow-up-left" size={20} color="#B0A4C8" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={s.card}>
                        <Text style={s.sectionTitle}>آراء الزبائن</Text>
                        {reviews.length === 0 ? (
                            <Text style={{ textAlign: "center", color: "#999", marginVertical: 20 }}>لا توجد تقييمات بعد</Text>
                        ) : (
                            reviews.map((review) => (
                                <View key={review.id} style={s.reviewItem}>
                                    <View style={s.reviewHeader}>
                                        <View style={s.guestLabel}>
                                            <View style={s.reviewerAvatar}>
                                                <Feather name="user" size={16} color="#6C4AB6" />
                                            </View>
                                            <Text style={s.ratingChipText}>{review.user_name || "مستخدم"}</Text>
                                        </View>
                                        <Text style={s.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={s.reviewStars}>{renderStars(review.rating)}</View>
                                    <Text style={s.reviewText}>{review.comment}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={s.bottomCTA}>
                <View style={s.ctaPriceInfo}>
                    <Text style={s.priceText}>
                        {(hall.base_price || 0).toLocaleString()} <Text style={s.currency}>₪</Text>
                    </Text>
                    <Text style={s.ctaLabel}>يبدأ من</Text>
                </View>
                <TouchableOpacity style={s.ctaButton} activeOpacity={0.85} onPress={() => NavigateTo("BookingRequest", { hall })}>
                    <LinearGradient
                        colors={["#7B5EC6", "#5B3A9E"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.ctaButtonGradient}
                    >
                        <Feather name="calendar" size={20} color="#FFF" />
                        <Text style={s.ctaButtonText}>احجز الآن</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}