import api from "./sessionApi";
import { Buffer } from "buffer";

const uploadToSupabase = async (uri: string, folder: string) => {
  try {
    console.log("TEST");
    const fileExt = uri.split(".").pop();
    console.log(fileExt);
    const response = await fetch(uri);
    console.log(response);
    const arrayBuffer = await response.arrayBuffer();
    console.log(arrayBuffer);
    const fileBase64 = Buffer.from(arrayBuffer).toString("base64");
    console.log(fileBase64)
    const { data } = await api.post(`/upload`, {
      fileBase64,
      folder,
      fileExt,
    });
    console.log("DONE");

    return data.url;
  } catch (err) {
    console.log("UPLOAD FAILED:", err);
    throw err;
  }
};

export { uploadToSupabase };
