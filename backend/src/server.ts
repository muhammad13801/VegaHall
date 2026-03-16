// src/server.ts
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Load .env before sending data
dotenv.config();

import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

// protected routes
app.use("/user", userRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
