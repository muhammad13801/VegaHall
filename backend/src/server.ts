// src/server.ts
import dotenv from "dotenv";
import express from "express";

// Load .env before sending data
dotenv.config();

import authRoutes from "./routes/auth";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
