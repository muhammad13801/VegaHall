import { Platform } from "react-native";
import { supabase } from "./supabaseClient";

const uploadToSupabase = async (uri: string, folder: string) => {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const fileExt = uri.split(".").pop();
  const path = `${folder}/${fileName}.${fileExt}`;

  const cleanUri = Platform.OS === "android" ? uri.replace("file://", "") : uri;

  // Convert URI to Blob
  const response = await fetch(
    Platform.OS === "android" ? `file://${cleanUri}` : cleanUri,
  );
  const blob = await response.blob();

  const { error } = await supabase.storage.from("Media").upload(path, blob, {
    contentType: folder === "images" ? "image/jpeg" : "video/mp4",
  });

  if (error) throw error;

  const { data } = supabase.storage.from("Media").getPublicUrl(path);
  return data.publicUrl;
};

export { uploadToSupabase };
