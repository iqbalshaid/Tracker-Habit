import { getChatResponse } from "../controller/ChatBoat.js";
import { VerifyMiddleware } from "../Middleware/VerifyUser.js";
import express from "express";
const route = express.Router();
route.post("/chat",VerifyMiddleware,getChatResponse);
export default route;