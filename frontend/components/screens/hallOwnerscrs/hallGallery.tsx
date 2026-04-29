import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { getHallByIdApi } from "../../Services/customerApi";
import { VideoCard } from "../../reusable func/videoCard";
import BackButton from "../../reusable func/backButton";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 1;
const ITEM_SIZE = SCREEN_WIDTH - 20;

export default function HallGallery() {
  const route = useRoute<any>();
  const hallId = route.params;
  const [media, setMedia] = useState<{ type: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await getHallByIdApi(hallId);

        const data = res.data;
        const combinedMedia = [
          ...(data.images || []).map((uri: string) => ({ type: "image", uri })),
          ...(data.videos || []).map((uri: string) => ({ type: "video", uri })),
        ];
        setMedia(combinedMedia);
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: error.response?.data || "فشل في تحميل المعرض",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [hallId]);

  const renderItem = ({ item }: { item: { type: string; uri: string } }) => {
    if (item.type === "video") {
      return (
        <View
          style={{
            marginVertical: 10,
            width: ITEM_SIZE,
            aspectRatio: 16 / 9,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          <VideoCard uri={item.uri} width={ITEM_SIZE} />
        </View>
      );
    }

    return (
      <View
        style={{
          marginVertical: 10,
          width: ITEM_SIZE,
          aspectRatio: 16 / 9,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
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
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#F8F9FD" }]}>
      <StatusBar barStyle="dark-content" />
      <BackgroundDecoration />
      <BackButton />

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#6C4AB6" />
          <Text style={{ marginTop: 10, color: "#6C4AB6" }}>
            جاري تحميل المعرض...
          </Text>
        </View>
      ) : media.length > 0 ? (
        <FlatList
          data={media}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="images-outline" size={64} color="#C4A8E8" />
          <Text style={{ marginTop: 10, color: "#999", fontSize: 16 }}>
            لا توجد صور أو فيديوهات
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
