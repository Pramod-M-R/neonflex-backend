import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;

