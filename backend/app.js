import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";


import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/users.routes.js";
import * as adminController from "./controllers/admin.controller.js";
import { adminAuth } from "./middleware/adminAuth.js";

const app = express();
const server = createServer(app);
const { io, activeRooms } = connectToSocket(server);
app.set("activeRooms", activeRooms);


app.set("port", (process.env.PORT || 8000))

// SECURITY: Add helmet with relaxed CSP for Google Fonts and internal APIs
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:8000", "ws://localhost:8000", "https://*.loca.lt", "https://*.ngrok-free.app"]
        }
    }
}));

// SECURITY: Configure CORS with specific options
app.use(cors({
    origin: ["http://localhost:3000", "http://192.168.56.1:3000"], // Add your Ngrok URL here for production
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

// ADMIN/BACKEND TEAM ROUTES
app.use("/api/v1/admin", adminAuth);
app.get("/api/v1/admin/stats", adminController.getSystemStats);
app.get("/api/v1/admin/meetings", adminController.getAllMeetings);
app.get("/api/v1/admin/users", adminController.getAllUsers);
app.get("/api/v1/admin/health", adminController.getSystemHealth);
app.put("/api/v1/admin/meeting/:id", adminController.updateMeeting);
app.put("/api/v1/admin/user/:id", adminController.updateUser);
app.delete("/api/v1/admin/meeting/:id", adminController.deleteMeeting);

app.get("/", (req, res) => {
    res.send("NexTalk Backend is running!");
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
    
    server.listen(app.get("port"), () => {
        console.log("LISTENING ON PORT " + app.get("port"));
    });
}



start();
