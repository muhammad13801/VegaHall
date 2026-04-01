import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { NavigateTo } from "../../reusable func/navigateTo";
import { VideoCard } from "../../reusable func/videoCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface HallCardProps {
  item: any;
  onPress?: (id: number) => void;
  isCustomer?: boolean;
  isFav?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export const HallCard = memo(({ item, onPress }: HallCardProps) => {
  const isActive = item.status === "Active";

  const media = useMemo(
    () => [
      ...(item.images || []).map((uri: string) => ({ type: "image", uri })),
      ...(item.videos || []).map((uri: string) => ({ type: "video", uri })),
    ],
    [item.images, item.videos],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  }, []);

  const handleStatusPress = useCallback(() => {
    if (!isActive) {
      NavigateTo("PaymentHall", {
        form: item,
        hallId: item.id,
        isReactivation: true,
      });
    }
  }, [isActive, item]);

  const handleCommentsPress = useCallback(() => {
    NavigateTo("HallComments", { hallId: item.id });
  }, [item.id]);

  const handleManagePress = useCallback(() => {
    onPress?.(item.id);
  }, [onPress, item.id]);

  const renderMediaItem = useCallback(
    ({ item: mediaItem }: { item: { type: string; uri: string } }) =>
      mediaItem.type === "image" ? (
        <View style={{ width: CARD_WIDTH, aspectRatio: 16 / 9 }}>
          <ImageBackground
            source={{ uri: mediaItem.uri }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
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
        <VideoCard uri={mediaItem.uri} width={CARD_WIDTH} />
      ),
    [],
  );

  return (
    <View
      style={[
        styles.card,
        { padding: 0, marginBottom: 20, overflow: "hidden" },
      ]}
    >
      {/* Media Slider */}
      {media.length > 0 ? (
        <View>
          <FlatList
            data={media}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={renderMediaItem}
          />

          {/* Dots */}
          {media.length > 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 8,
                gap: 6,
              }}
            >
              {media.map((_, i) => (
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

          {/* Badge */}
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

          {/* Customer Favorite Button */}
          {isCustomer && onToggleFavorite && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 20,
                  width: 32,
                  height: 32,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => onToggleFavorite(item.id)}
              >
                  <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#E74C3C" : "#999"} />
              </TouchableOpacity>
          )}
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

      <TouchableOpacity
        activeOpacity={isCustomer ? 0.9 : 1}
        onPress={() => isCustomer && onPress?.(item.id)}
        style={{ padding: 15 }}
      >
        {/* Name + Status */}
        <View style={[styles.info, { marginBottom: 10 }]}>
          <Text style={[styles.title, { fontSize: 22 }]}>{item.hall_name || item.name}</Text>
          {!isCustomer && (
            <TouchableOpacity
              style={[
                styles.items,
                { backgroundColor: isActive ? "#E8F5E9" : "#FFF3E0" },
              ]}
              onPress={handleStatusPress}
              disabled={isActive}
            >
              <Text
                style={[
                  styles.itemText,
                  { color: isActive ? "#2E7D32" : "#EF6C00" },
                ]}
              >
                {isActive ? "نشط" : "غير نشط ✦ اضغط للتفعيل"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location */}
        <View
          style={[
            styles.row,
            { alignItems: "center", marginBottom: 8, gap: 5 },
          ]}
        >
          <Ionicons name="location-outline" size={16} color="#6C4AB6" />
          <Text style={[styles.subtitle, { marginBottom: 0, fontSize: 13 }]}>
            {item.city} {item.address ? `- ${item.address}` : ""}
          </Text>
        </View>

        {/* Capacity + Price */}
        <View style={[styles.info, { marginBottom: 12 }]}>
          <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
            <Ionicons name="people-outline" size={16} color="#6C4AB6" />
            <Text style={styles.profileLabel}>{item.capacity} شخص</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#4CAF50" }}>
            ₪{item.price?.toLocaleString()}
          </Text>
        </View>

        {/* Rating + Comments */}
        <View style={[styles.info, { marginBottom: 12 }]}>
          <View style={[styles.row, { alignItems: "center", gap: 4 }]}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= Math.round(item.avg_rating || 0)
                    ? "star"
                    : "star-outline"
                }
                size={18}
                color="#FFC107"
              />
            ))}
            <Text style={[styles.profileValue, { color: "#333" }]}>
              {item.avg_rating
                ? Number(item.avg_rating).toFixed(1)
                : "لا يوجد تقييم"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.items, { backgroundColor: "#F3EAFF" }]}
            onPress={handleCommentsPress}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#6C4AB6" />
            <Text style={styles.itemText}>التعليقات</Text>
            {Number(item.comment_count) > 0 && (
              <View
                style={{
                  backgroundColor: "#6C4AB6",
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginRight: 4,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}
                >
                  {item.comment_count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Manage button */}
        <TouchableOpacity
          style={[styles.secondaryActionButton, { marginTop: 5, height: 40 }]}
          onPress={handleManagePress}
        >
          <Text style={[styles.signUpText, { fontSize: 14 }]}>
            إدارة الصالة
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
