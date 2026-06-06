import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import {
  approveHall,
  getRequestedHalls,
  rejectHall,
} from "../../Services/adminApi";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

type MediaItem = { type: string; url: string };

type Hall = {
  id: number;
  hall_name: string;
  city: string;
  address: string;
  capacity: number;
  base_price: number;
  description: string;
  latitude: number | null;
  longitude: number | null;
  first_name: string;
  last_name: string;
  media: MediaItem[];
};

function groupHalls(rows: any[]): Hall[] {
  const map = new Map<number, Hall>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        hall_name: row.hall_name,
        city: row.city,
        address: row.address,
        capacity: row.capacity,
        base_price: row.base_price,
        description: row.description,
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
        first_name: row.first_name,
        last_name: row.last_name,
        media: [],
      });
    }
    if (row.url) {
      map.get(row.id)!.media.push({ type: row.type, url: row.url });
    }
  }
  return Array.from(map.values());
}

// ─── Hall card ───────────────────────────────────────────────────────────────

const RequestedHallCard = memo(
  ({
    item,
    rejectingId,
    rejectReasons,
    setRejectingId,
    setRejectReasons,
    onApprove,
    onReject,
  }: {
    item: Hall;
    rejectingId: number | null;
    rejectReasons: Record<number, string>;
    setRejectingId: (id: number | null) => void;
    setRejectReasons: React.Dispatch<
      React.SetStateAction<Record<number, string>>
    >;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
  }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // ── Build media list ──────────────────────────────────────────────────────
    // images first (max 3) → videos (max 1) → license last (always included)
    const media = useMemo(
      () => [
        ...item.media
          .filter((m) => m.type === "image")
          .slice(0, 3)
          .map((m) => ({ type: "image" as const, uri: m.url })),
        ...item.media
          .filter((m) => m.type === "video")
          .slice(0, 1)
          .map((m) => ({ type: "video" as const, uri: m.url })),
        ...item.media
          .filter((m) => m.type === "license")
          .slice(0, 1)
          .map((m) => ({ type: "license" as const, uri: m.url })),
      ],
      [item.media],
    );

    const onScroll = useCallback((e: any) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH));
    }, []);

    const renderMediaItem = useCallback(
      ({
        item: m,
      }: {
        item: { type: "image" | "video" | "license"; uri: string };
      }) => {
        const isLicense = m.type === "license";
        return (
          <View style={{ width: CARD_WIDTH, aspectRatio: 16 / 9 }}>
            {/* Blurred background */}
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

            {/* License overlay badge */}
            {isLicense && (
              <View
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  backgroundColor: "rgba(25,118,210,0.85)",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Ionicons name="document-text-outline" size={13} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}
                >
                  رخصة / ترخيص
                </Text>
              </View>
            )}
          </View>
        );
      },
      [],
    );

    const lat = item.latitude != null ? Number(item.latitude) : null;
    const lng = item.longitude != null ? Number(item.longitude) : null;
    const coordsLabel =
      lat != null && lng != null
        ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        : null;

    return (
      <View style={[styles.card, { padding: 0, overflow: "hidden" }]}>
        {/* ── Media gallery ── */}
        {media.length > 0 ? (
          <View>
            <FlatList
              data={media}
              pagingEnabled
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              renderItem={renderMediaItem}
              style={{ direction: "ltr" }}
              keyExtractor={(_, i) => i.toString()}
            />

            {/* counter badge */}
            <View
              style={{
                position: "absolute",
                top: 10,
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
                    : media[activeIndex]?.type === "license"
                      ? "document-text-outline"
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

        {/* ── Details ── */}
        <View style={{ padding: 15 }}>
          {/* Name + "pending" badge */}
          <View style={[styles.info, { marginBottom: 10 }]}>
            <Text style={[styles.title, { fontSize: 20, flex: 1 }]}>
              {item.hall_name}
            </Text>
            <View
              style={[
                styles.items,
                { backgroundColor: "#E3F2FD", marginLeft: 10 },
              ]}
            >
              <Text
                style={[styles.itemText, { color: "#1976D2", fontSize: 11 }]}
              >
                قيد المراجعة
              </Text>
            </View>
          </View>

          {/* Owner */}
          <InfoRow
            icon="person-outline"
            label={`${item.first_name} ${item.last_name}`}
          />

          {/* Location */}
          <InfoRow
            icon="location-outline"
            label={`${item.city}${item.address ? ` - ${item.address}` : ""}`}
          />

          {/* Capacity + Price */}
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

          {/* GPS */}
          {coordsLabel && (
            <InfoRow icon="navigate-outline" label={coordsLabel} />
          )}

          {/* Description */}
          {!!item.description && (
            <View
              style={{
                backgroundColor: "#F5F5F5",
                borderRadius: 8,
                padding: 10,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#444",
                  lineHeight: 20,
                }}
              >
                {item.description}
              </Text>
            </View>
          )}

          {/* ── Action buttons ── */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#E8F5E9",
                borderRadius: 8,
                padding: 10,
                alignItems: "center",
              }}
              onPress={() => onApprove(item.id)}
            >
              <Text style={{ color: "#2E7D32", fontWeight: "bold" }}>
                ✔ موافقة
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#FFEBEE",
                borderRadius: 8,
                padding: 10,
                alignItems: "center",
              }}
              onPress={() =>
                setRejectingId(rejectingId === item.id ? null : item.id)
              }
            >
              <Text style={{ color: "#C62828", fontWeight: "bold" }}>
                ✘ رفض
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Reject reason input ── */}
          {rejectingId === item.id && (
            <View style={{ marginTop: 10 }}>
              <TextInput
                value={rejectReasons[item.id] ?? ""}
                onChangeText={(text) =>
                  setRejectReasons((prev) => ({ ...prev, [item.id]: text }))
                }
                placeholder="سبب الرفض..."
                style={{
                  borderWidth: 0.5,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                  textAlign: "right",
                }}
                multiline
              />
              <TouchableOpacity
                style={{
                  backgroundColor: "#C62828",
                  borderRadius: 8,
                  padding: 10,
                  alignItems: "center",
                }}
                onPress={() => onReject(item.id)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  إرسال الرفض
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  },
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ManageRequestedHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<number, string>>(
    {},
  );

  const fetchHalls = useCallback(async () => {
    try {
      const { data } = await getRequestedHalls();
      setHalls(groupHalls(data));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data || "فشل في تحميل القاعات",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  const approve = useCallback(async (id: number) => {
    try {
      const response = await approveHall(id);
      setHalls((prev) => prev.filter((h) => h.id !== id));
      Toast.show({
        type: "success",
        text1: response?.data || "تمت الموافقة على القاعة بنجاح",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data || "فشل في قبول القاعة",
      });
    }
  }, []);

  const reject = useCallback(
    async (id: number) => {
      const currentReason = rejectReasons[id] ?? "";
      if (!currentReason.trim()) return Alert.alert("تنبيه", "أدخل سبب الرفض");
      try {
        const response = await rejectHall(id, currentReason);
        setHalls((prev) => prev.filter((h) => h.id !== id));
        setRejectingId(null);
        setRejectReasons((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        Toast.show({
          type: "success",
          text1: response?.data || "تمت رفض القاعة بنجاح",
        });
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: error.response?.data || "فشل في رفض القاعة",
        });
      }
    },
    [rejectReasons],
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={halls}
        keyExtractor={(h) => h.id.toString()}
        renderItem={({ item }) => (
          <RequestedHallCard
            item={item}
            rejectingId={rejectingId}
            rejectReasons={rejectReasons}
            setRejectingId={setRejectingId}
            setRejectReasons={setRejectReasons}
            onApprove={approve}
            onReject={reject}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              color: "#999",
              marginTop: "70%",
            }}
          >
            لا توجد قاعات معلقة
          </Text>
        }
      />
    </SafeAreaView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  containerStyle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  containerStyle?: object;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 3,
        },
        containerStyle,
      ]}
    >
      <Ionicons name={icon} size={13} color="#666" />
      <Text style={{ fontSize: 13, color: "#666", flexShrink: 1 }}>
        {label}
      </Text>
    </View>
  );
}

function Chip({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontSize: 12, color, fontWeight: "500" }}>{label}</Text>
    </View>
  );
}
