// src/server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load .env before sending data
dotenv.config();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import hallRoutes from "./routes/hallRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/auth", authRoutes);

// protected routes
app.use("/user", userRoutes);
app.use("/halls", hallRoutes);
app.use("/notifications", notificationRoutes);
app.use("/customer", customerRoutes);
app.use("/admin", adminRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Export the app for Vercel
export default app;

// Only listen locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
