import React from "react";
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
import { HallFormProps } from "./constants";

export default function MediaPicker({ form, setForm, errors }: HallFormProps) {
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("تنبيه", "يرجى السماح بالوصول إلى الصور");

    const currentCount = form.images?.length || 0;
    if (currentCount >= 8)
      return Alert.alert("تنبيه", "لقد وصلت للحد الأقصى من الصور (8)");

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 8 - currentCount,
    });

    if (!result.canceled) {
      // Build a data URI from the base64 string so it's self-contained and
      // can be stored in the DB and loaded on any device.
      const newImages = result.assets.map((asset: any) => asset.uri);
      setForm((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("تنبيه", "يرجى السماح بالوصول إلى الفيديوهات");

    const currentVideoCount = form.videos?.length || 0;
    if (currentVideoCount >= 1)
      return Alert.alert("تنبيه", "لقد وصلت للحد الأقصى من الفيديوهات (1)");

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "videos",
      allowsEditing: true,
      quality: 0.7,
      videoMaxDuration: 30,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      setForm((prev: any) => ({
        ...prev,
        videos: [...(prev.videos || []), result.assets[0].uri],
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const removeVideo = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      videos: prev.videos?.filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <View style={styles.mb20}>
      <View style={[styles.row, { marginBottom: 10 }]}>
        <Ionicons
          name="images-outline"
          size={18}
          color={"#6C4AB6"}
          style={styles.screenIcon}
        />
        <Text style={styles.label}>صور وفيديوهات الصالة</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={pickImages}
          style={{
            flex: 1,
            height: 60,
            backgroundColor: "#F3F0FF",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "#6C4AB6",
          }}
        >
          <Ionicons name="camera" size={24} color="#6C4AB6" />
          <Text style={{ fontSize: 10, color: "#6C4AB6" }}>اضافة صور</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={pickVideo} style={styles.mediaPickerButton}>
          <Ionicons name="videocam" size={24} color="#6C4AB6" />
          <Text style={{ fontSize: 10, color: "#6C4AB6" }}>اضافة فيديو</Text>
        </TouchableOpacity>
      </View>

      {/* Media Preview Gallery */}
      {(form.images.length > 0 || (form.videos?.length || 0) > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaPreviewContainer}
          contentContainerStyle={[styles.row, { gap: 10, paddingRight: 10 }]}
        >
          {form.images.map((uri, index) => (
            <View key={`image-${index}`} style={styles.mediaPreviewItem}>
              <Image source={{ uri }} style={styles.mediaImage} />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={styles.mediaDeleteButton}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
          {form.videos?.map((uri, index) => (
            <View key={`video-${index}`} style={styles.mediaPreviewItem}>
              <View style={styles.mediaVideoPlaceholder}>
                <Ionicons name="videocam" size={30} color="#6C4AB6" />
                <Text
                  style={{
                    fontSize: 10,
                    color: "#6C4AB6",
                    marginTop: 2,
                    fontWeight: "bold",
                  }}
                >
                  فيديو
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeVideo(index)}
                style={styles.mediaDeleteButton}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Media Count */}
      {(form.images.length > 0 || (form.videos?.length || 0) > 0) && (
        <View style={{ flexDirection: "row", marginTop: 10, gap: 15 }}>
          <Text style={{ fontSize: 12, color: "#666" }}>
            الصور: {form.images.length}
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            الفيديوهات: {form.videos?.length || 0}
          </Text>
        </View>
      )}
      {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
    </View>
  );
}
