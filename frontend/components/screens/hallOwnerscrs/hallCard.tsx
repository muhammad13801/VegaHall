import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { NavigateTo } from "../../reusable func/navigateTo";
import { VideoCard } from "../../reusable func/videoCard";
import { InfoRow } from "../../reusable func/infoRow";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

export const HallCard = memo(
  ({ item, onPress, isCustomer, isFav, onToggleFavorite }: any) => {
    const isActive = item.status === "active";
    const [activeIndex, setActiveIndex] = useState(0);

    const media = useMemo(
      () => [
        ...(item.images || [])
          .slice(0, 3)
          .map((uri: string) => ({ type: "image", uri })),
        ...(item.videos || [])
          .slice(0, 1)
          .map((uri: string) => ({ type: "video", uri })),
      ],
      [item.images, item.videos],
    );

    const onScroll = useCallback((e: any) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH));
    }, []);

    const renderMediaItem = useCallback(
      ({ item: m }: any) =>
        m.type === "image" ? (
          <View style={{ width: CARD_WIDTH, aspectRatio: 16 / 9 }}>
            <ImageBackground
              source={{ uri: m.uri }}
              style={{ flex: 1 }}
              resizeMode="cover"
              blurRadius={15}
            >
              <Image
                source={{ uri: m.uri }}
                style={{ flex: 1 }}
                resizeMode="contain"
              />
            </ImageBackground>
          </View>
        ) : (
          <VideoCard uri={m.uri} width={CARD_WIDTH} />
        ),
      [],
    );

    return (
      <View style={[styles.card, { padding: 0, overflow: "hidden" }]}>
        <View>
          {media.length > 0 ? (
            <View>
              <FlatList
                data={media}
                horizontal
                inverted
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                renderItem={renderMediaItem}
                style={{ direction: "ltr" }}
                keyExtractor={(_, i) => i.toString()}
              />
              {/* Gallery Button */}
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
                onPress={() => NavigateTo("HallGallery", item.id)}
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

          {isCustomer && (
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 20,
                width: 34,
                height: 34,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => onToggleFavorite?.(item.id)}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={20}
                color={isFav ? "#E74C3C" : "#999"}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={isCustomer ? 0.9 : 1}
          onPress={() => isCustomer && onPress?.(item.id)}
          style={{ padding: 15 }}
        >
          <View style={[styles.info, { marginBottom: 10 }]}>
            <Text style={[styles.title, { fontSize: 20, flex: 1 }]}>
              {item.hall_name || item.name}
            </Text>
            {!isCustomer && (
              <TouchableOpacity
                style={[
                  styles.items,
                  {
                    backgroundColor: isActive ? "#E8F5E9" : "#FFF3E0",
                    marginLeft: 10,
                  },
                ]}
                onPress={() =>
                  !isActive &&
                  NavigateTo("PaymentHall", {
                    form: item,
                    hallId: item.id,
                    isReactivation: true,
                  })
                }
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: isActive ? "#2E7D32" : "#EF6C00", fontSize: 11 },
                  ]}
                >
                  {isActive ? "نشط" : "غير نشط ✦ تفعيل"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <InfoRow
            icon="location-outline"
            label={`${item.city} ${item.address ? `- ${item.address}` : ""}`}
          />

          <View style={styles.info}>
            <InfoRow
              icon="people-outline"
              label={`${item.capacity} شخص`}
              containerStyle={{ paddingVertical: 0, width: "50%" }}
            />
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#4CAF50" }}
            >
              ₪{item.base_price}
            </Text>
          </View>

          <View style={[styles.info, { marginTop: 5 }]}>
            <View
              style={{ flexDirection: "row", gap: 2, alignItems: "center" }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={
                    s <= Math.round(item.avg_rating || 0)
                      ? "star"
                      : "star-outline"
                  }
                  size={16}
                  color="#FFC107"
                />
              ))}
              <Text style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>
                {Number(item.avg_rating || 0).toFixed(1)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.items, { marginHorizontal: 0 }]}
              onPress={() => NavigateTo("HallComments", { hallId: item.id })}
            >
              <Ionicons name="chatbubble-outline" size={14} color="#6C4AB6" />
              <Text style={styles.itemText}>
                التعليقات ({item.comment_count || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {!isCustomer && (
            <TouchableOpacity
              style={[
                styles.secondaryActionButton,
                { height: 40, marginTop: 15 },
              ]}
              onPress={() => onPress?.(item.id)}
            >
              <Text style={styles.actionText}>إدارة الصالة</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);
