import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import officerRoutes from "./src/routes/officerRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartcert")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export default app;
