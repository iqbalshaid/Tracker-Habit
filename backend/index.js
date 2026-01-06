import { initializeTelemetry } from "./telementry-init.js";
import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import Userroute from "./Routes/Userroute.js";
import Habitroute from "./Routes/Habitroute.js";
import { dbConnection } from "./db/dbConnection.js";
import "./Middleware/redisClient.js"
import chatBoat from "./Routes/chatBoat.js";
dotenv.config();
initializeTelemetry()
const app = express();
app.use(express.json());
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT||5000; // Change the port number here

app.get('/', (req, res) => {
    res.send('Hello World!');
  });
const conect = ()=>{
         
         mongoose.connect(process.env.MONGO_URL,{
            //useNewUrlParser:true,
            useUnifiedTopology:true,
            
        }).then(()=>
        console.log("database was connected"))
    .catch((err)=>{
        console.log("database was disconnected");

    })
}
 // Call the connection function
conect();
dbConnection("shahid","postgres","shahid");

app.use("",Userroute);
app.use("",Habitroute);
app.use("",chatBoat);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
