import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./server/routes/auth.routes.js";
import userRoutes from "./server/routes/user.routes.js";
import applyRoutes from "./server/routes/apply.routes.js";
import rechargeRoutes from "./server/routes/recharge.routes.js";
import orderRoutes from "./server/routes/order.routes.js";
import noticeRoutes from "./server/routes/notice.routes.js";
import connectDB from "./server/DB/databaseConfigs.js";
import { uploder } from "./server/middleware/uploder.js";
import { v2 as cloudinary } from "cloudinary";

import { uploadSingle } from "./server/middleware/uploadSingle.js";

const app = express();

const PORT = process.env.PORT || 5000;


dotenv.config();
app.use(cors());
app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.post("/uploads", uploder.single("uploads"));
app.use("/api/apply", applyRoutes);
app.use("/api/order", uploder.single("file"), orderRoutes);
app.use("/api/recharge", rechargeRoutes);
app.use("/api/notice", noticeRoutes);


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.post("/upload", uploder.single("file"), uploadSingle, async (req, res) => {
  res.send(req.body)
  // try {
  //   const uploadResponse = await cloudinary.uploader.upload(req.file.path);
  //   fs.unlink(req.file.path, (err) => {
  //     if (err) {
  //       console.error("Error deleting file:", err);
  //     } else {
  //       console.log("File deleted successfully");
  //     }
  //   });
  //   res.status(200).send(uploadResponse);
  // } catch (error) {
  //   console.log(error);
  // }
});
app.get("/", (req, res) => {
  res.send("Hello to online API");
});

app.get("/api/data", async (req, res) => {
  const { nid, dob } = req.query;

  if (!nid || !dob) {
    return res.status(400).json({ error: "National ID and Date of Birth are required." });
  }

  try {
    const apiUrl = `https://api.foxithub.com/unofficial/api.php?key=on9354&nid=5084024412&dob=1965-12-31`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server Running on port ${PORT}`);
});
