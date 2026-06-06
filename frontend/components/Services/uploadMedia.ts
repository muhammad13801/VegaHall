import { supabase } from "./supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const uploadToSupabase = async (uri: string, folder: string) => {
  try {
    const fileExt = uri.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) throw new Error("User ID not found");

    const getContentType = (
      folder: string,
      fileExt: string | undefined,
    ): string => {
      switch (folder) {
        case "images":
          return `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;
        case "videos":
          return `video/${fileExt}`;
        case "licenses":
          return `licenses/${fileExt === "jpg" ? "jpeg" : fileExt}`;
        default:
          return `application/${fileExt}`;
      }
    };

    const contentType = getContentType(folder, fileExt);
    const path = `${userId}/${folder}/${fileName}`;

    // Use FormData + Blob for memory-efficient uploads (especially for videos)
    const formData = new FormData();
    formData.append("file", { uri, name: fileName, type: contentType } as any);

    const { error } = await supabase.storage
      .from("Media")
      .upload(path, formData, {
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
