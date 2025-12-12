import jwt from "jsonwebtoken";
import {User} from "../db/dbConnection.js";
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
    console.log("Verifying token:", token);
    const decoded = jwt.verify(token, process.env.JWT);
    console.log("Decoded token:", decoded.id);
   
     const user = await User.findByPk(decoded.id, {
  attributes: ["id", "email"]
});

if (!user) {
  return res.status(401).json({ message: "User not found" });
}

req.user = user;
console.log("Verified user:", req.user.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
