import { SignIn,SignUp,Delete,UpdatePassword,verify,getUserData} from "../controller/User.js";
import { VerifyMiddleware } from "../Middleware/VerifyUser.js";
import express from "express"
const route = express.Router()
route.post("/signup",SignUp);
route.post("/signin",SignIn);
route.delete("/delete",VerifyMiddleware,Delete);
route.put("/update",VerifyMiddleware,UpdatePassword);
route.get("/verify",VerifyMiddleware,verify);
route.get("/get/:id",VerifyMiddleware,getUserData);

export default route;