import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
    "https://niche-community-frontend-3qpy.vercel.app",
    "https://niche-community-frontend.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow any localhost port in development (Vite auto-increments ports)
        if (/^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, true);
        }

        // Allow any 127.0.0.1 port as well
        if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
            return callback(null, true);
        }

        // Check explicit production whitelist
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
