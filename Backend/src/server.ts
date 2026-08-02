import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDatabase from "./config/database";
import weatherRoutes from "./weatherroutes";
import authRoutes from "./authroutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/weather", weatherRoutes);
app.use("/api/auth", authRoutes);

// Database Connection
connectDatabase();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WeatherSphere Backend is Running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});