import { supabase } from "./supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const uploadToSupabase = async (uri: string, folder: string) => {
  try {
    const fileExt = uri.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) throw new Error("User ID not found");

    // Use arrayBuffer for better stability in React Native/Expo
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    const path = `${userId}/${folder}/${fileName}`;
    const contentType =
      folder === "images"
        ? `image/${fileExt === "jpg" ? "jpeg" : fileExt}`
        : `video/${fileExt}`;

    const { error } = await supabase.storage
      .from("Media")
      .upload(path, arrayBuffer, {
        contentType: contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("Media").getPublicUrl(path);

    return data.publicUrl;
  } catch (err) {
    console.log("UPLOAD FAILED:", err);
    throw err;
  }
};

export { uploadToSupabase };
