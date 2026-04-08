import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id).select('-passwordHash');
        if(!user){
            return res.status(401).json({ message: "User not found, authorization denied" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export default protect;