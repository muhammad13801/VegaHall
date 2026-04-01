// src/server.ts
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load .env before sending data
dotenv.config();

import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import hallRoutes from "./routes/hallRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import customerRoutes from "./routes/customerRoutes";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/auth", authRoutes);

// protected routes
app.use("/user", userRoutes);
app.use("/halls", hallRoutes);
app.use("/upload", uploadRoutes);
app.use("/notifications", notificationRoutes);

app.use("/customer", customerRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
