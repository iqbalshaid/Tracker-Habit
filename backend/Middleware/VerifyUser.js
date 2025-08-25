import jwt from "jsonwebtoken";
import User from "../Model/User.js";
export const VerifyMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // "Bearer token"
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer" ke baad ka token
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
     req.user = await User.findById(decoded.id).select("_id email"); // <- ये जरूरी है
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
