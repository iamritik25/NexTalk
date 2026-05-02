import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import mongoose from "mongoose";

export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMeetings = await Meeting.countDocuments();
        const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
        
        res.json({
            users: totalUsers,
            meetings: totalMeetings,
            database: dbStatus,
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development"
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching stats" });
    }
};

export const getAllMeetings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Meeting.countDocuments();
        
        // Fetch meetings and manually join with user data for deep analysis
        const meetings = await Meeting.find().sort({ date: -1 }).skip(skip).limit(limit).lean();
        
        const activeRooms = req.app.get("activeRooms") || {};
        
        const meetingsWithUsers = await Promise.all(meetings.map(async (m) => {
            const user = await User.findOne({ username: m.user_id }, "name username").lean();
            const roomId = `/${m.meetingCode}`;
            return {
                ...m,
                hostDetails: user || { name: "Guest", username: m.user_id },
                startTime: m.date,
                participantCount: activeRooms[roomId] || 0
            };
        }));

        res.json({ meetings: meetingsWithUsers, total });
    } catch (e) {
        res.status(500).json({ message: "Error fetching meetings" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Exclude passwords for security
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        await Meeting.findByIdAndDelete(req.params.id);
        res.json({ message: "Meeting record deleted" });
    } catch (e) {
        res.status(500).json({ message: "Error deleting meeting" });
    }
};

export const getSystemHealth = async (req, res) => {
    try {
        const memory = process.memoryUsage();
        const cpu = process.cpuUsage();
        
        res.json({
            memory: {
                rss: (memory.rss / 1024 / 1024).toFixed(2), // MB
                heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2),
                heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2)
            },
            cpu: {
                user: cpu.user,
                system: cpu.system
            },
            platform: process.platform,
            nodeVersion: process.version
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching health" });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { meetingCode } = req.body;
        await Meeting.findByIdAndUpdate(id, { meetingCode });
        res.json({ message: "Meeting updated successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error updating meeting" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username } = req.body;
        await User.findByIdAndUpdate(id, { name, username });
        res.json({ message: "User updated successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error updating user" });
    }
};
