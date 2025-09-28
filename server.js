import express from "express";
import dotenv from "dotenv";
import cors from "cors";  // <-- import cors
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Enable CORS
app.use(cors({
    origin: "http://localhost:5173", // allow your frontend
    credentials: true,               // optional, for cookies/auth
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/communities", communityRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
