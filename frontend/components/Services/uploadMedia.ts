import { supabase } from "./supabaseClient";

const uploadToSupabase = async (uri: string, folder: string) => {
  try {
    // generate file name
    const fileExt = uri.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const path = `${folder}/${fileName}`;

    // 🔥 FIX: use arrayBuffer instead of blob
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    // upload to Supabase
    const { error } = await supabase.storage
      .from("Media")
      .upload(path, arrayBuffer, {
        contentType: folder === "images" ? "image/jpeg" : "video/mp4",
      });

    if (error) {
      console.log("UPLOAD ERROR:", error);
      throw error;
    }

    // get public URL
    const { data } = supabase.storage.from("Media").getPublicUrl(path);

    return data.publicUrl;
  } catch (err) {
    console.log("UPLOAD FAILED:", err);
    throw err;
  }
};

export { uploadToSupabase };
