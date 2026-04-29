import { Router } from "express";
import { supabase } from "../services/supabaseClient.js";
import {
  type AuthRequest,
  sessionAuthenticate,
} from "../middleware/sessionMiddleware.js";

const router = Router();

router.post("/", sessionAuthenticate, async (req: AuthRequest, res) => {
  try {
    const { fileBase64, folder, fileExt } = req.body;
    const userId = req.userId;

    if (!fileBase64 || !folder || !fileExt)
      return res.status(400).json({ error: "بيانات مفقودة" });

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const path = `${userId}/${folder}/${fileName}`;
    const buffer = Buffer.from(fileBase64, "base64");
    const contentType = folder === "images" ? "image/jpeg" : "video/mp4";

    const { error } = await supabase.storage
      .from("Media")
      .upload(path, buffer, { contentType });

    if (error) throw error;

    const { data } = supabase.storage.from("Media").getPublicUrl(path);
    res.json({ url: data.publicUrl });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
