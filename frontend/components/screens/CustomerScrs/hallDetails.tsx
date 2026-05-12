import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  FlatList,
  ImageBackground,
  RefreshControl,
  Linking,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { NavigateTo } from "../../reusable func/navigateTo";
import {
  getHallByIdApi,
  getHallRatingsApi,
  getFavoritesApi,
  toggleFavoriteApi,
} from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { VideoCard } from "../../reusable func/videoCard";
import { InfoRow } from "../../reusable func/infoRow";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HallDetails({ route }: any) {
  const initialHall = route?.params?.hall;
  const [hall, setHall] = useState<any>(initialHall);
  const [loading, setLoading] = useState(!initialHall);
  const [refreshing, setRefreshing] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const { triggerRefresh } = useRefresh();
  const [activeIndex, setActiveIndex] = useState(0);
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
    } catch (err: any) { // [معدّل - كان error]
      console.error("Failed to fetch hall details:", err);
      Toast.show({
        type: "error",
        text1: err.response?.data || "فشل تحميل تفاصيل الصالة",
      });
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
    } catch (err) { // [معدّل]
      console.error("Failed to toggle favorite:", err);
      setIsFav(isFav);
    }
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `تفقد هذه القاعة المميزة: ${hall.hall_name} في ${hall.city || hall.hall_location || ""}\nيمكنك حجزها الآن عبر تطبيق فيجا هول!`,
      });
    } catch (err) { // [معدّل]
      console.error("Error sharing:", err);
    }
  };
  const media = useMemo(() => {
    if (!hall) return [];
    const images = (hall.images || []).map((uri: string) => ({
      type: "image",
      uri,
    }));
    const videos = (hall.videos || []).map((uri: string) => ({
      type: "video",
      uri,
    }));
    return [...images, ...videos];
  }, [hall]);
  const onScroll = useCallback((e: any) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  }, []);

  const renderMediaItem = useCallback(
    ({ item }: any) =>
      item.type === "image" ? (
        <View style={{ width: SCREEN_WIDTH, aspectRatio: 16 / 9 }}>
          <ImageBackground
            source={{ uri: item.uri }}
            style={{ flex: 1 }}
            resizeMode="cover"
            blurRadius={15}
          >
            <Image
              source={{ uri: item.uri }}
              style={{ flex: 1 }}
              resizeMode="contain"
            />
          </ImageBackground>
        </View>
      ) : (
        <VideoCard uri={item.uri} width={SCREEN_WIDTH} />
      ),
    [],
  );
  const renderStars = (rating: number) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Ionicons
        key={s}
        name={s <= Math.round(rating || 0) ? "star" : "star-outline"}
        size={18}
        color="#FFC107"
      />
    ));
  if (!hall && loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#6C4AB6" />
        <Text style={{ marginTop: 12, color: "#6C4AB6", fontWeight: "600" }}>
          جاري تحميل التفاصيل...
        </Text>
      </SafeAreaView>
    );
  }
  if (!hall) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>لا توجد بيانات</Text>
      </SafeAreaView>
    );
  }
  const services = hall.services || [];
  const mealOptions = hall.meal_options || hall.mealOptions || [];
  const contacts = [
    ...(hall.owner_phone
      ? [
          {
            name: `${hall.owner_first_name || ""} ${
              hall.owner_last_name || ""
            }`.trim(),
            phone: hall.owner_phone,
          },
        ]
      : []),
    ...(hall.secondary_contacts || hall.secondaryContacts || []).map(
      (c: any) => ({
        name: `${c.first_name || c.name || ""} ${c.last_name || ""}`.trim(),
        phone: c.phone_number,
      }),
    ),
  ].filter((contact) => contact.phone);
  const rating = Number(hall.average_rating || hall.rating || 0);
  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C4AB6"]}
          />
        }
      >
        <View style={{ marginBottom: 10 }}>
          {media.length > 0 ? (
            <>
              <FlatList
                data={media}
                horizontal
                inverted
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                renderItem={renderMediaItem}
                keyExtractor={(_, i) => i.toString()}
                style={{ direction: "ltr" }}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
                onPress={() => NavigateTo("HallGallery", hall.id)}
              >
                <Ionicons name="images" size={14} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}
                >
                  المعرض
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons
                  name={
                    media[activeIndex]?.type === "video"
                      ? "videocam"
                      : "image-outline"
                  }
                  size={13}
                  color="#fff"
                />
                <Text style={{ color: "#fff", fontSize: 11 }}>
                  {activeIndex + 1} / {media.length}
                </Text>
              </View>
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={handleToggleFavorite}
                >
                  <Ionicons
                    name={isFav ? "heart" : "heart-outline"}
                    size={21}
                    color={isFav ? "#E74C3C" : "#FFF"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={handleShare}
                >
                  <Ionicons name="share-social-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View
              style={{
                width: "100%",
                aspectRatio: 16 / 9,
                backgroundColor: "#F3EAFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="business-outline" size={64} color="#C4A8E8" />
            </View>
          )}
        </View>
        <View style={{ padding: 15, alignItems: "center" }}>
          <View style={{ marginBottom: 15, alignItems: "center" }}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: 28,
                  color: "#333",
                  textAlign: "center",
                  marginBottom: 8,
                },
              ]}
            >
              {hall.hall_name || hall.name}
            </Text>
            <View
              style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
            >
              <View
                style={{ flexDirection: "row", gap: 3, alignItems: "center" }}
              >
                {renderStars(rating)}
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    fontWeight: "bold",
                    marginLeft: 5,
                  }}
                >
                  {rating.toFixed(1)}
                </Text>
              </View>
              <View style={{ width: 1, height: 14, backgroundColor: "#DDD" }} />
              <View
                style={[
                  styles.items,
                  {
                    backgroundColor: "#F3EAFF",
                    marginHorizontal: 0,
                    height: 26,
                    paddingHorizontal: 10,
                  },
                ]}
              >
                <Text
                  style={[styles.itemText, { color: "#6C4AB6", fontSize: 12 }]}
                >
                  {hall.reviews_count || hall.reviewsCount || 0} تقييم
                </Text>
              </View>
            </View>
            {hall.description && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#777",
                  marginTop: 10,
                  textAlign: "center",
                  lineHeight: 20,
                  paddingHorizontal: 20,
                }}
              >
                {hall.description}
              </Text>
            )}
          </View>
          <View style={[styles.card, { padding: 15 }]}>
            <TouchableOpacity
              onPress={() => {
                const query = hall.location || `${hall.city} ${hall.address}`;
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    query,
                  )}`,
                );
              }}
              activeOpacity={0.75}
            >
              <InfoRow
                icon="location-outline"
                label="الموقع"
                value={`${hall.city || ""}${
                  hall.address ? ` - ${hall.address}` : ""
                }`}
              />
            </TouchableOpacity>
            <View style={styles.row}>
              <InfoRow
                icon="people-outline"
                label="السعة"
                value={`${hall.capacity || 0} شخص`}
                containerStyle={{ width: "50%" }}
              />
              <InfoRow
                icon="cash-outline"
                label="السعر الأساسي"
                value={`₪${(hall.base_price || 0).toLocaleString()}`}
                valueStyle={{ color: "#6C4AB6" }}
              />
            </View>
          </View>
          {services.length > 0 && (
            <View style={[styles.card, { padding: 15 }]}>
              <InfoRow
                label="الخدمات المتاحة"
                icon="star-outline"
                containerStyle={{ paddingVertical: 0 }}
              />
              <View style={[styles.row, { flexWrap: "wrap" }]}>
                {services.map((svc: any, i: number) => {
                  const svcName = typeof svc === "string" ? svc : svc.name;
                  const svcPrice =
                    typeof svc === "object" && svc.price ? svc.price : 0;
                  return (
                    <InfoRow
                      key={i}
                      icon="star"
                      iconSize={18}
                      label={svcName}
                      labelStyle={{ fontSize: 15 }}
                      value={svcPrice > 0 ? `₪${svcPrice}` : ""}
                      valueStyle={{ fontSize: 14, color: "#6C4AB6" }}
                      containerStyle={{ width: "50%", paddingVertical: 5 }}
                    />
                  );
                })}
              </View>
            </View>
          )}
          {mealOptions.length > 0 && (
            <View style={[styles.card, { padding: 15 }]}>
              <InfoRow
                label="أنواع الوجبات"
                icon="restaurant-outline"
                containerStyle={{ paddingVertical: 0 }}
              />
              <View style={[styles.row, { flexWrap: "wrap" }]}>
                {mealOptions.map((meal: any, i: number) => (
                  <InfoRow
                    key={i}
                    icon="restaurant"
                    iconSize={18}
                    label={meal.name}
                    labelStyle={{ fontSize: 15 }}
                    value={`${meal.price_per_person} ₪/شخص`}
                    valueStyle={{ fontSize: 14, color: "#6C4AB6" }}
                    containerStyle={{ width: "50%", paddingVertical: 8 }}
                  />
                ))}
              </View>
            </View>
          )}
          <View style={[styles.card, { padding: 15 }]}>
            <InfoRow
              icon="call-outline"
              label="جهات الاتصال"
              containerStyle={{ paddingVertical: 0, marginBottom: 10 }}
            />
            {contacts.length === 0 ? (
              <Text style={[styles.profileLabel, { textAlign: "center" }]}>
                لا توجد جهات اتصال
              </Text>
            ) : (
              contacts.map((contact: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                >
                  <InfoRow
                    icon="person"
                    label={contact.name || "بدون اسم"}
                    value={contact.phone}
                    hideBorder={i === contacts.length - 1}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
          <View style={[styles.card, { padding: 15 }]}>
            <InfoRow
              icon="chatbubble-outline"
              label="آراء الزبائن"
              containerStyle={{ paddingVertical: 0, marginBottom: 2 }}
            />
            {reviews.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  color: "#999",
                  marginVertical: 10,
                }}
              >
                لا توجد تقييمات بعد
              </Text>
            ) : (
              reviews.map((review: any, index: number) => (
                <InfoRow
                  key={`${review.id}-${index}`}
                  icon="person"
                  label={review.user_name || "مستخدم"}
                  value={review.comment || ""}
                  hideBorder={index === reviews.length - 1}
                  containerStyle={{ alignItems: "flex-start", paddingVertical: 5 }}
                  iconStyle={{ marginTop: 5 }}
                />
              ))
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.row,
              {
                gap: 8,
                width: "96%",
                marginBottom: 20,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => NavigateTo("BookingRequest", { hall })}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFF" />
            <Text style={[styles.actionButtonText]}>احجز الآن</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}