
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/dbConnection.js";
const SignUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword
    });
   console.log("User registered:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const UpdatePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id } }
    );

    res.status(200).json({ message: "Account updated" });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const Delete = async (req, res) => {
  try {
    const { id } = req.user;

    await User.destroy({ where: { id } });

    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const verify = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "email"]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "email"]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



export {SignIn,SignUp,Delete,UpdatePassword,verify,getUserData};
