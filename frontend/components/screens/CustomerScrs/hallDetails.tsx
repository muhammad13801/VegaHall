import { useState, useEffect } from "react";
import { Text,TouchableOpacity,View,ScrollView,StatusBar,Dimensions,FlatList,NativeSyntheticEvent,NativeScrollEvent,Linking,ImageBackground,Image,ActivityIndicator,RefreshControl,} from "react-native";
import {Ionicons } from "@expo/vector-icons";
import {SafeAreaView } from "react-native-safe-area-context";
import {NavigateTo } from "../../reusable func/navigateTo";
import {getHallByIdApi,getHallRatingsApi,getFavoritesApi,toggleFavoriteApi} from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { VideoCard } from "../../reusable func/videoCard";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <View style={[styles.card, { marginBottom: 16 }]}>
    <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 14 }]}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: "#F3EAFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon as any} size={18} color="#6C4AB6" />
      </View>
      <Text style={styles.label}>{title}</Text>
    </View>

    {children}
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={[styles.row, { alignItems: "center", gap: 10, marginBottom: 12 }]}>
    <Ionicons name={icon as any} size={16} color="#6C4AB6" />
    <Text style={styles.profileLabel}>{label}</Text>
    <Text style={[styles.profileValue, { flex: 1 }]}>{value}</Text>
  </View>
);

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
    } catch (error: any) {
      console.error("Failed to fetch hall details:", error);
      Toast.show({
        type: "error",
        text1: error.response?.data || "فشل تحميل تفاصيل الصالة",
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
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsFav(isFav);
    }
  };

  const onGalleryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveSlide(index);
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= Math.round(rating || 0) ? "star" : "star-outline"}
        size={18}
        color="#FFC107"
      />
    ));
  };

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

  const images: string[] = hall.images || [];
  const videos: string[] = hall.videos || [];
  const media = [
    ...images.map((uri: string) => ({ type: "image", uri })),
    ...videos.map((uri: string) => ({ type: "video", uri })),
  ];

  const services = hall.services || [];
  const mealOptions = hall.meal_options || hall.mealOptions || [];

  const contacts = [
    ...(hall.owner_phone
      ? [
          {
            name: `${hall.owner_first_name || ""} ${hall.owner_last_name || ""}`.trim(),
            phone: hall.owner_phone,
          },
        ]
      : []),
    ...(hall.secondary_contacts || hall.secondaryContacts || []).map((c: any) => ({
      name: `${c.first_name || c.name || ""} ${c.last_name || ""}`.trim(),
      phone: c.phone_number,
    })),
  ].filter((contact) => contact.phone);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#5B3A9E" />
      <BackgroundDecoration />

      <View style={{ width: "100%" }}>
        <BackButton />
      </View>

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
        {media.length > 0 ? (
          <View style={{ marginBottom: 4 }}>
            <FlatList
              data={media}
              keyExtractor={(_: any, i: number) => i.toString()}
              horizontal
              inverted
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onGalleryScroll}
              scrollEventThrottle={16}
              style={{ direction: "ltr" }}
              renderItem={({ item }: { item: { type: string; uri: string } }) =>
                item.type === "image" ? (
                  <View style={{ width: SCREEN_WIDTH, aspectRatio: 16 / 9 }}>
                    <ImageBackground
                      source={{ uri: item.uri }}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                      }}
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
                  <VideoCard uri={item.uri} width={SCREEN_WIDTH} />
                )
              }
            />

            {media.length > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingVertical: 8,
                  gap: 6,
                }}
              >
                {media.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      width: i === activeSlide ? 18 : 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: i === activeSlide ? "#6C4AB6" : "#DDD",
                    }}
                  />
                ))}
              </View>
            )}

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
                name={media[activeSlide]?.type === "video" ? "videocam" : "image-outline"}
                size={13}
                color="#fff"
              />
              <Text style={{ color: "#fff", fontSize: 11 }}>
                {activeSlide + 1} / {media.length}
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
              >
                <Ionicons name="share-social-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
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

        <View
          style={{
            justifyContent: "center",
            alignSelf: "center",
            marginBottom: 20,
          }}
        >
          <View style={[styles.card, { marginBottom: 16 }]}>
            <View style={[styles.info, { alignItems: "center", marginBottom: 10 }]}>
              <Text style={[styles.title, { fontSize: 22, flex: 1 }]}>
                {hall.hall_name || hall.name}
              </Text>

              <View style={[styles.items, { backgroundColor: "#F3EAFF" }]}>
                <Text style={[styles.itemText, { color: "#6C4AB6" }]}>
                  ₪{(hall.base_price || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.row,
                { alignItems: "center", gap: 4, marginBottom: 8 },
              ]}
            >
              {renderStars(Number(hall.average_rating || hall.rating || 0))}
              <Text style={[styles.profileLabel, { marginRight: 4 }]}>
                {Number(hall.average_rating || hall.rating || 0).toFixed(1)}
                {" "}
                ({hall.reviews_count || hall.reviewsCount || 0} تقييم)
              </Text>
            </View>

            {hall.description ? (
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 22,
                  marginTop: 4,
                }}
              >
                {hall.description}
              </Text>
            ) : null}
          </View>

          <SectionCard title="تفاصيل الصالة" icon="information-circle-outline">
            <TouchableOpacity
              onPress={() => {
                const query = hall.location || `${hall.city} ${hall.address}`;
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
                );
              }}
              activeOpacity={0.75}
            >
              <InfoRow
                icon="location-outline"
                label="الموقع"
                value={`${hall.city || ""}${hall.address ? ` - ${hall.address}` : ""}`}
              />
            </TouchableOpacity>

            <InfoRow
              icon="people-outline"
              label="السعة"
              value={`${hall.capacity || 0} شخص`}
            />

            <InfoRow
              icon="cash-outline"
              label="السعر"
              value={`₪${(hall.base_price || 0).toLocaleString()}`}
            />

            {hall.location && (
              <TouchableOpacity
                style={[
                  styles.secondaryActionButton,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 4,
                  },
                ]}
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${hall.location}`
                  )
                }
              >
                <Ionicons name="map-outline" size={18} color="#6C4AB6" />
                <Text style={[styles.actionText, { fontSize: 15 }]}>
                  عرض الخريطة
                </Text>
              </TouchableOpacity>
            )}
          </SectionCard>

          {services.length > 0 && (
            <SectionCard title="الخدمات المتاحة" icon="star-outline">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {services.map((svc: any, i: number) => {
                  const svcName = typeof svc === "string" ? svc : svc.name;
                  const svcPrice = typeof svc === "object" && svc.price ? svc.price : 0;

                  return (
                    <View key={i} style={styles.items}>
                      <Text style={styles.itemText}>{svcName}</Text>
                      {svcPrice > 0 && (
                        <Text style={[styles.itemText, { color: "#888" }]}>
                          {" "}
                          — {svcPrice} ₪
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </SectionCard>
          )}

          {mealOptions.length > 0 && (
            <SectionCard title="خيارات الطعام والوجبات" icon="restaurant-outline">
              {mealOptions.map((meal: any, i: number) => (
                <View key={i} style={[styles.info, { marginBottom: 8 }]}>
                  <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                    <Ionicons
                      name="restaurant-outline"
                      size={15}
                      color="#6C4AB6"
                    />
                    <Text style={styles.profileValue}>{meal.name}</Text>
                  </View>

                  <Text style={[styles.itemText, { color: "#6C4AB6" }]}>
                    {meal.price_per_person} ₪/شخص
                  </Text>
                </View>
              ))}
            </SectionCard>
          )}

          <SectionCard title="جهات الاتصال" icon="call-outline">
            {contacts.length === 0 ? (
              <Text style={[styles.profileLabel, { textAlign: "center" }]}>
                لا توجد جهات اتصال
              </Text>
            ) : (
              contacts.map((contact: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.row,
                    {
                      alignItems: "center",
                      gap: 12,
                      marginBottom: i < contacts.length - 1 ? 12 : 0,
                      paddingBottom: i < contacts.length - 1 ? 12 : 0,
                      borderBottomWidth: i < contacts.length - 1 ? 1 : 0,
                      borderBottomColor: "#EEE",
                    },
                  ]}
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                >
                  <View
                    style={[
                      styles.profileInfoIcon,
                      {
                        borderRadius: 20,
                        backgroundColor: "#F3EAFF",
                        height: 40,
                      },
                    ]}
                  >
                    <Ionicons name="person" size={20} color="#6C4AB6" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileValue}>
                      {contact.name || "بدون اسم"}
                    </Text>
                    <Text style={styles.profileLabel}>{contact.phone}</Text>
                  </View>

                  <Ionicons name="call-outline" size={20} color="#6C4AB6" />
                </TouchableOpacity>
              ))
            )}
          </SectionCard>

          <SectionCard title="آراء الزبائن" icon="chatbubble-outline">
            {reviews.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#999", marginVertical: 10 }}>
                لا توجد تقييمات بعد
              </Text>
            ) : (
              reviews.map((review) => (
                <View
                  key={review.id}
                  style={{
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#EEE",
                  }}
                >
                  <View style={[styles.info, { marginBottom: 6 }]}>
                    <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                      <View
                        style={[
                          styles.profileInfoIcon,
                          {
                            borderRadius: 20,
                            backgroundColor: "#F3EAFF",
                            height: 36,
                            width: 36,
                          },
                        ]}
                      >
                        <Ionicons name="person-outline" size={18} color="#6C4AB6" />
                      </View>
                      <Text style={styles.profileValue}>
                        {review.user_name || "مستخدم"}
                      </Text>
                    </View>

                    <Text style={styles.profileLabel}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={[styles.row, { alignItems: "center", gap: 3, marginBottom: 6 }]}>
                    {renderStars(review.rating)}
                  </View>

                  <Text style={{ fontSize: 14, color: "#666", lineHeight: 21 }}>
                    {review.comment}
                  </Text>
                </View>
              ))
            )}
          </SectionCard>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 20,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => NavigateTo("BookingRequest", { hall })}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>احجز الآن</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}