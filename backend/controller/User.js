
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/dbConnection.js";
const SignUp = async (req,res)=>{
    try{
      
    const {email,password} = req.body;
    console.log(req.body);
    const existingUser = await User.findOne({ where:{email:email} });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
console.log("hello");
    // save new user
    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    

    res.status(201).json({ message: "User registered successfully" });
    }
    catch(error){
      
 res.status(500).json({ message: "Something went wrong" });
    }
    
};
const SignIn = async (req,res)=>{
     try {
    // handle nested email object from frontend
     const{email,password} = req.body;

    // check user exists
    const user = await User.findOne({ where:{email:email} });
    if (!user) return res.status(404).json({ message: "User not found" });

    // compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    // safely include settings (in case undefined)
  

    res.status(200).json({
      user: { id: user._id, email: user.email },
      token,
    });
  } catch (error) {
    console.error(error); // ✅ log the real error
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}
const UpdatePassword = async (req, res) => {
  try {
    const { id } = req.user; // middleware se aayega
    const { password } = req.body;

    const updateData = {};

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // if (performanceGoal !== undefined) {
    //   updateData["settings.performanceGoal"] = performanceGoal;
    // }

    // if (localeCode) {
    //   updateData["settings.locale.code"] = localeCode;
    // }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({ message: "Account updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
const Delete = async(req,res)=>{
    try{
 const { id } = req.user;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Account deleted" });

    }
    catch(error){
 res.status(500).json({ message: "Something went wrong" });
    }
}
const verify = async(req,res)=>{
    try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
const getUserData = async(req,res)=>{
  try{
   
 const user = await User.findById(req.params.id);
  
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
  }
  catch(error){
    res.status(500).json({ message: "Server error" });
  }
}


export {SignIn,SignUp,Delete,UpdatePassword,verify,getUserData};
