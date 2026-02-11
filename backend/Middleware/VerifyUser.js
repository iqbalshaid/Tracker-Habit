import jwt from "jsonwebtoken";
import { User } from "../db/dbConnection.js";
import logger  from "./logger.js";
import {
  isRedisConnected,
  get,
  exists,
  sismember,
} from "./redisClient.js"

export const VerifyMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // "Bearer token"
  
  if (!authHeader) {
    logger.warnWithContext("No authorization header provided", req);
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer" ke baad ka token
  if (!token) {
    logger.warnWithContext("Invalid token format", req, { authHeader });
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    
     
    logger.infoWithContext("Verifying token", req, { token: token.slice(0, 10) + "..." });
    
    const decoded = jwt.verify(token, process.env.JWT);
    
      if (isRedisConnected()) {
      // blacklist check
      const blacklisted = await exists(`blacklist:${token}`);
      if (blacklisted) {
        return res.status(401).json({ message: "Token revoked" });
      }

      // active session check
      const active = await sismember(`user:${decoded.id}:tokens`, token);
      if (!active) {
        return res.status(401).json({ message: "Session expired" });
      }

      // session info (optional)
      const session = await get(`user:${decoded.id}:session`);
      req.session = session ? JSON.parse(session) : null;
    }

    const user = await User.findByPk(decoded.id, { attributes: ["id", "email"] });
    if (!user) {
      logger.warnWithContext("User not found for token", req, { userId: decoded.id });
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    logger.infoWithContext("Token verified successfully", req, { userId: user.id });

    next();
  } catch (err) {
    logger.errorWithContext("Token verification failed", err, req);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
