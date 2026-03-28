import api from "./sessionApi";
import { Buffer } from "buffer";

const uploadToSupabase = async (uri: string, folder: string) => {
  try {
    const fileExt = uri.split(".").pop();
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const fileBase64 = Buffer.from(arrayBuffer).toString("base64");

    const { data } = await api.post(`/upload`, {
      fileBase64,
      folder,
      fileExt,
    });

    return data.url;
  } catch (err) {
    console.log("UPLOAD FAILED:", err);
    throw err;
  }
};

export { uploadToSupabase };
