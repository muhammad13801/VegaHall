import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { NavigateTo } from "../../reusable func/navigateTo";
import { getHallApi } from "../../Services/hallApi";
import { VideoCard } from "../../reusable func/videoCard";
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
    <View
      style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 14 }]}
    >
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
  <View
    style={[styles.row, { alignItems: "center", gap: 10, marginBottom: 12 }]}
  >
    <Ionicons name={icon as any} size={16} color="#6C4AB6" />
    <Text style={styles.profileLabel}>{label}</Text>
    <Text style={[styles.profileValue, { flex: 1 }]}>{value}</Text>
  </View>
);

export default function HallDetail() {
  const route = useRoute<any>();
  const hallId = route.params?.hallId;

  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const { data } = await getHallApi(hallId);
        setHall(data);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: err.response?.data || "فشل تحميل بيانات الصالة",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHall();
  }, [hallId]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

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

  if (!hall) return null;

  const images: string[] = hall.images || [];
  const videos: string[] = hall.videos || [];
  const media = [
    ...images.map((uri: string) => ({ type: "image", uri })),
    ...videos.map((uri: string) => ({ type: "video", uri })),
  ];

  const isActive = hall.status === "active";

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Media Slider */}
        {media.length > 0 ? (
          <View style={{ marginBottom: 4 }}>
            <FlatList
              data={media}
              keyExtractor={(_: any, i: number) => i.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={({
                item: mediaItem,
              }: {
                item: { type: string; uri: string };
              }) =>
                mediaItem.type === "image" ? (
                  <View style={{ width: SCREEN_WIDTH, aspectRatio: 16 / 9 }}>
                    <ImageBackground
                      source={{ uri: mediaItem.uri }}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                      }}
                      resizeMode="cover"
                      blurRadius={15}
                    />
                    <Image
                      source={{ uri: mediaItem.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <VideoCard uri={mediaItem.uri} width={SCREEN_WIDTH} />
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
                      width: i === activeIndex ? 18 : 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: i === activeIndex ? "#6C4AB6" : "#DDD",
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
            marginBottom: 10,
          }}
        >
          {/* Title + Status + Rating + Description */}
          <View style={[styles.card, { marginBottom: 16 }]}>
            <View
              style={[styles.info, { alignItems: "center", marginBottom: 10 }]}
            >
              <Text style={[styles.title, { fontSize: 22, flex: 1 }]}>
                {hall.hall_name}
              </Text>
              <View
                style={[
                  styles.items,
                  { backgroundColor: isActive ? "#E8F5E9" : "#FFF3E0" },
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: isActive ? "#2E7D32" : "#EF6C00" },
                  ]}
                >
                  {isActive ? "نشط" : "غير نشط"}
                </Text>
              </View>
            </View>

            {/* Stars */}
            <View
              style={[
                styles.row,
                { alignItems: "center", gap: 4, marginBottom: 8 },
              ]}
            >
              {[1, 2, 3, 4, 5].map((star: number) => (
                <Ionicons
                  key={star}
                  name={
                    star <= Math.round(hall.avg_rating || 0)
                      ? "star"
                      : "star-outline"
                  }
                  size={18}
                  color="#FFC107"
                />
              ))}
              <Text style={[styles.profileLabel, { marginRight: 4 }]}>
                {hall.avg_rating
                  ? Number(hall.avg_rating).toFixed(1)
                  : "لا يوجد تقييم بعد"}
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

          {/* Basic Info */}
          <SectionCard title="تفاصيل الصالة" icon="information-circle-outline">
            <InfoRow
              icon="location-outline"
              label="الموقع"
              value={`${hall.city} - ${hall.address}`}
            />
            <InfoRow
              icon="people-outline"
              label="السعة"
              value={`${hall.capacity} شخص`}
            />
            <InfoRow
              icon="cash-outline"
              label="السعر"
              value={`₪${hall.base_price}`}
            />
          </SectionCard>

          {/* Services */}
          {hall.services && hall.services.length > 0 && (
            <SectionCard title="الخدمات المتاحة" icon="star-outline">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {hall.services.map((s: any, i: number) => (
                  <View key={i} style={styles.items}>
                    <Text style={styles.itemText}>{s.name}</Text>
                    {s.price > 0 && (
                      <Text style={[styles.itemText, { color: "#888" }]}>
                        {" "}
                        — {s.price} ₪
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* Meal Options — now a separate section */}
          {hall.mealOptions && hall.mealOptions.length > 0 && (
            <SectionCard title="أنواع الوجبات" icon="restaurant-outline">
              {hall.mealOptions.map((m: any, i: number) => (
                <View key={i} style={[styles.info, { marginBottom: 8 }]}>
                  <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                    <Ionicons
                      name="restaurant-outline"
                      size={15}
                      color="#6C4AB6"
                    />
                    <Text style={styles.profileValue}>{m.name}</Text>
                  </View>
                  <Text style={[styles.itemText, { color: "#6C4AB6" }]}>
                    {m.price_per_person} ₪/شخص
                  </Text>
                </View>
              ))}
            </SectionCard>
          )}

          {/* Secondary Contacts */}
          <SectionCard title="جهات الاتصال" icon="call-outline">
            {hall.phone_number && (
              <View
                style={[
                  styles.row,
                  {
                    alignItems: "center",
                    gap: 12,
                    marginBottom: hall.secondaryContacts?.length ? 12 : 0,
                    paddingBottom: hall.secondaryContacts?.length ? 12 : 0,
                    borderBottomWidth: hall.secondaryContacts?.length ? 1 : 0,
                    borderBottomColor: "#EEE",
                  },
                ]}
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
                <View>
                  <Text style={styles.profileValue}>
                    {hall.first_name} {hall.last_name}
                  </Text>
                  <Text style={styles.profileLabel}>{hall.phone_number}</Text>
                </View>
              </View>
            )}

            {hall.secondaryContacts?.map((c: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.row,
                  {
                    alignItems: "center",
                    gap: 12,
                    marginBottom:
                      i < hall.secondaryContacts.length - 1 ? 12 : 0,
                    paddingBottom:
                      i < hall.secondaryContacts.length - 1 ? 12 : 0,
                    borderBottomWidth:
                      i < hall.secondaryContacts.length - 1 ? 1 : 0,
                    borderBottomColor: "#EEE",
                  },
                ]}
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
                <View>
                  <Text style={styles.profileValue}>
                    {c.first_name} {c.last_name}
                  </Text>
                  <Text style={styles.profileLabel}>{c.phone_number}</Text>
                </View>
              </View>
            ))}
          </SectionCard>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[
              styles.secondaryActionButton,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 10,
              },
            ]}
            onPress={() => NavigateTo("HallComments", { hallId })}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#6C4AB6" />
            <Text style={[styles.actionText, { fontSize: 15 }]}>
              عرض التعليقات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              },
            ]}
            onPress={() => NavigateTo("ManageHall", { hallId })}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>تعديل الصالة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
