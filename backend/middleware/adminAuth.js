import { User } from "../models/user.model.js";

export const adminAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized to access this route" });
        }

        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Check if user is admin. 
        // NOTE: If you get a 403 error here, it means you need to update your user document 
        // in MongoDB to have role: "admin"
        if (user.role !== "admin") {
            return res.status(403).json({ message: "User is not authorized to perform this action" });
        }

        req.user = user;
        next();
    } catch (e) {
        return res.status(500).json({ message: "Authentication error" });
    }
};
