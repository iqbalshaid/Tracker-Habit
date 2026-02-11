import { initializeTelemetry } from "./telementry-init.js";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import Userroute from "./Routes/Userroute.js";
import Habitroute from "./Routes/Habitroute.js";
import chatBoat from "./Routes/chatBoat.js";
import { dbConnection } from "./db/dbConnection.js";

dotenv.config();
initializeTelemetry();

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ PostgreSQL connection only (Sequelize)
await dbConnection(
  process.env.DB_NAME || "shahid",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "shahid"
);

// routes
app.use("", Userroute);
app.use("", Habitroute);
app.use("", chatBoat);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
