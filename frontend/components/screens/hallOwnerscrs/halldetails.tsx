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
import { InfoRow } from "../../reusable func/infoRow";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title?: string;
  icon?: string;
  children?: React.ReactNode;
}) => (
  <View style={[styles.card, { padding: 15 }]}>
    <View
      style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 15 }]}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: "#F3EAFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon as any} size={18} color="#6C4AB6" />
      </View>
      <Text style={[styles.label, { fontSize: 16, marginBottom: 0 }]}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

export default function HallDetail() {
  const { hallId } = useRoute<any>().params || {};
  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
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
    })();
  }, [hallId]);

  const media = useMemo(() => {
    if (!hall) return [];
    const images = (hall.images || [])
      .slice(0, 3)
      .map((uri: string) => ({ type: "image", uri }));
    const videos = (hall.videos || [])
      .slice(0, 1)
      .map((uri: string) => ({ type: "video", uri }));
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

  if (loading)
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
  if (!hall) return null;

  const isActive = hall.status === "active";

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />

      <ScrollView showsVerticalScrollIndicator={false}>
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
          {/* Main Title Section */}
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
              {hall.hall_name}
            </Text>
            <View
              style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
            >
              <View
                style={{ flexDirection: "row", gap: 3, alignItems: "center" }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={
                      s <= Math.round(hall.avg_rating || 0)
                        ? "star"
                        : "star-outline"
                    }
                    size={18}
                    color="#FFC107"
                  />
                ))}
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    fontWeight: "bold",
                    marginLeft: 5,
                  }}
                >
                  {Number(hall.avg_rating || 0).toFixed(1)}
                </Text>
              </View>
              <View style={{ width: 1, height: 14, backgroundColor: "#DDD" }} />
              <View
                style={[
                  styles.items,
                  {
                    backgroundColor: isActive ? "#E8F5E9" : "#FFF3E0",
                    marginHorizontal: 0,
                    height: 26,
                    paddingHorizontal: 10,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: isActive ? "#2E7D32" : "#EF6C00", fontSize: 12 },
                  ]}
                >
                  {isActive ? "نشط" : "غير نشط"}
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
            <InfoRow
              icon="location-outline"
              label="الموقع"
              value={`${hall.city} - ${hall.address}`}
            />
            <View style={styles.row}>
              <InfoRow
                icon="people-outline"
                label="السعة"
                value={`${hall.capacity} شخص`}
                containerStyle={{ width: "50%" }}
              />
              <InfoRow
                icon="cash-outline"
                label="السعر الأساسي"
                value={`₪${hall.base_price}`}
                valueStyle={{ color: "#6C4AB6" }}
              />
            </View>
          </View>

          {hall.services?.length > 0 && (
            <View style={[styles.card, { padding: 15 }]}>
              <InfoRow
                label="الخدمات المتاحة"
                icon="star-outline"
                containerStyle={{ paddingVertical: 0 }}
              />
              <View style={[styles.row, { flexWrap: "wrap" }]}>
                {hall.services.map((s: any, i: number) => (
                  <InfoRow
                    key={i}
                    icon="star"
                    iconSize={18}
                    label={s.name}
                    labelStyle={{ fontSize: 15 }}
                    value={s.price > 0 && `₪${s.price}`}
                    valueStyle={{ fontSize: 14, color: "#6C4AB6" }}
                    containerStyle={{ width: "50%", paddingVertical: 5 }}
                  />
                ))}
              </View>
            </View>
          )}

          {hall.mealOptions?.length > 0 && (
            <View style={[styles.card, { padding: 15 }]}>
              <InfoRow
                label="أنواع الوجبات"
                icon="restaurant-outline"
                containerStyle={{ paddingVertical: 0 }}
              />
              <View style={[styles.row, { flexWrap: "wrap" }]}>
                {hall.mealOptions.map((m: any, i: number) => (
                  <InfoRow
                    key={i}
                    icon="restaurant"
                    iconSize={18}
                    label={m.name}
                    labelStyle={{ fontSize: 15 }}
                    value={`${m.price_per_person} ₪/شخص`}
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
            {hall.phone_number && (
              <InfoRow
                icon="person"
                label={`${hall.first_name} ${hall.last_name}`}
                value={hall.phone_number}
                hideBorder={!hall.secondaryContacts?.length}
              />
            )}
            {hall.secondaryContacts?.map((c: any, i: number) => (
              <InfoRow
                key={i}
                icon="person"
                label={`${c.first_name} ${c.last_name}`}
                value={c.phone_number}
                hideBorder={i === hall.secondaryContacts.length - 1}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.secondaryActionButton,
              styles.row,
              {
                marginTop: 15,
                gap: 8,
                width: "98%",
              },
            ]}
            onPress={() => NavigateTo("HallComments", { hallId })}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6C4AB6" />
            <Text style={[styles.actionText, { fontSize: 16 }]}>
              عرض التعليقات والتقييمات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.row,
              {
                gap: 8,
                width: "98%",
              },
            ]}
            onPress={() => NavigateTo("ManageHall", { hallId })}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>تعديل بيانات الصالة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
