import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";

interface HallCardProps {
  item: any;
  onPress?: (id: number) => void;
}

export const HallCard = ({ item, onPress }: HallCardProps) => {
  // console.log(`[HallCard] Rendering ${item.name}, images:`, item.images);
  const isSelected = item.status === "Active";
  const statusColor = isSelected ? "#2E7D32" : "#EF6C00";
  const statusBg = isSelected ? "#E8F5E9" : "#FFF3E0";

  const hasImage = item.images && item.images.length > 0;

  return (
    <View style={[styles.card, { padding: 0, marginBottom: 20 }]}>
      {hasImage ? (
        <Image
          source={{ uri: item.images[0] }}
          style={{ width: "100%", height: 180 }}
          resizeMode="cover"
        />
      ) : (
        // Placeholder when hall has no images yet
        <View
          style={{
            width: "100%",
            height: 180,
            backgroundColor: "#F3EAFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="business-outline" size={64} color="#C4A8E8" />
        </View>
      )}

      <View style={{ padding: 15 }}>
        <View style={[styles.info, { marginBottom: 10 }]}>
          <Text style={[styles.title, { fontSize: 22 }]}>{item.name}</Text>
          <View
            style={[styles.items, { backgroundColor: statusBg, marginLeft: 0 }]}
          >
            <Text style={[styles.itemText, { color: statusColor }]}>
              {isSelected ? "نشط" : "قيد المراجعة"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.row,
            { alignItems: "center", marginBottom: 8, gap: 5 },
          ]}
        >
          <Ionicons name="location-outline" size={16} color="#6C4AB6" />
          <Text style={[styles.subtitle, { marginBottom: 0, fontSize: 13 }]}>
            {item.city} - {item.address}
          </Text>
        </View>

        <View style={styles.info}>
          <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
            <Ionicons name="people-outline" size={16} color="#6C4AB6" />
            <Text style={{ fontSize: 13, color: "#666" }}>
              {item.capacity} شخص
            </Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#4CAF50" }}>
            ${item.price}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.secondaryActionButton, { marginTop: 15, height: 40 }]}
          onPress={() => onPress?.(item.id)}
        >
          <Text style={[styles.signUpText, { fontSize: 14 }]}>
            إدارة الصالة
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
