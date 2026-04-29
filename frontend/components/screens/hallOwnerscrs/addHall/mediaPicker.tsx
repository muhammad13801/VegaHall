import React, { useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../../../styles";
import { HallFormProps } from "../../../Validations/validateHall";
import { Err } from "../../../reusable func/Err";

const MediaItem = memo(
  ({
    uri,
    isVideo,
    onRemove,
  }: {
    uri?: string;
    isVideo?: boolean;
    onRemove: () => void;
  }) => (
    <View style={styles.mediaPreviewItem}>
      {isVideo ? (
        <View style={styles.mediaVideoPlaceholder}>
          <Ionicons name="videocam" size={30} color="#6C4AB6" />
          <Text style={{ fontSize: 10, color: "#6C4AB6", fontWeight: "bold" }}>
            فيديو
          </Text>
        </View>
      ) : (
        <Image source={{ uri }} style={styles.mediaImage} />
      )}
      <TouchableOpacity onPress={onRemove} style={styles.mediaDeleteButton}>
        <Ionicons name="close" size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  ),
);

export default function MediaPicker({ form, setForm, errors }: HallFormProps) {
  const handleMedia = useCallback(
    async (type: "images" | "videos") => {
      const isImg = type === "images";
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted")
        return Alert.alert(
          "تنبيه",
          `يرجى السماح بالوصول إلى ${isImg ? "الصور" : "الفيديوهات"}`,
        );

      const current = form[type]?.length || 0;
      const limit = isImg ? 8 : 1;
      if (current >= limit)
        return Alert.alert("تنبيه", `وصلت للحد الأقصى (${limit})`);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [isImg ? "images" : "videos"],
        allowsMultipleSelection: isImg,
        allowsEditing: !isImg,
        quality: 0.7,
        selectionLimit: isImg ? 8 - current : 1,
      });

      if (!result.canceled) {
        setForm((prev) => ({
          ...prev,
          [type]: [
            ...(prev[type] || []),
            ...(isImg
              ? result.assets.map((a) => a.uri)
              : [result.assets[0].uri]),
          ],
        }));
      }
    },
    [form.images, form.videos, setForm],
  );

  const remove = (type: "images" | "videos", i: number) =>
    setForm((p) => ({ ...p, [type]: p[type]?.filter((_, idx) => idx !== i) }));

  const hasMedia = form.images.length > 0 || (form.videos?.length || 0) > 0;

  const PickerBtn = ({
    type,
    icon,
    label,
  }: {
    type: "images" | "videos";
    icon: any;
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => handleMedia(type)}
      style={styles.mediaPickerButton}
    >
      <Ionicons name={icon} size={24} color="#6C4AB6" />
      <Text style={{ fontSize: 10, color: "#6C4AB6" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mb20}>
      <View style={[styles.row, { marginBottom: 10 }]}>
        <Ionicons
          name="images-outline"
          size={18}
          color="#6C4AB6"
          style={styles.screenIcon}
        />
        <Text style={styles.label}>صور وفيديوهات الصالة</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <PickerBtn type="images" icon="camera" label="اضافة صور" />
        <PickerBtn type="videos" icon="videocam" label="اضافة فيديو" />
      </View>

      {hasMedia && (
        <ScrollView
          horizontal
          style={styles.mediaPreviewContainer}
          contentContainerStyle={[styles.row, { gap: 10, paddingRight: 10 }]}
          showsHorizontalScrollIndicator={false}
        >
          {form.images.map((uri, i) => (
            <MediaItem
              key={`i-${i}`}
              uri={uri}
              onRemove={() => remove("images", i)}
            />
          ))}
          {form.videos?.map((_, i) => (
            <MediaItem
              key={`v-${i}`}
              isVideo
              onRemove={() => remove("videos", i)}
            />
          ))}
        </ScrollView>
      )}

      {hasMedia && (
        <Text style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
          الصور: {form.images.length} | الفيديوهات: {form.videos?.length || 0}
        </Text>
      )}

      <Err error={errors.images} />
    </View>
  );
}
