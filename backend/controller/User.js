import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/dbConnection.js";
import logger from "../Middleware/logger.js";

// SignUp
const SignUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warnWithContext("Missing email or password", req);
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warnWithContext("User already exists", req, { email });
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });

    logger.infoWithContext("User registered successfully", req, { email });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.errorWithContext("Error in SignUp", error, req);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// SignIn
const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warnWithContext("Missing email or password", req);
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warnWithContext("User not found", req, { email });
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      logger.warnWithContext("Invalid credentials", req, { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT, { expiresIn: "7d" });

    logger.infoWithContext("User logged in", req, { email, userId: user.id });

    res.status(200).json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    logger.errorWithContext("Error in SignIn", error, req);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update Password
const UpdatePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { password } = req.body;

    if (!password) {
      logger.warnWithContext("Password required", req, { userId: id });
      return res.status(400).json({ message: "Password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashedPassword }, { where: { id } });

    logger.infoWithContext("Password updated successfully", req, { userId: id });

    res.status(200).json({ message: "Account updated" });
  } catch (error) {
    logger.errorWithContext("Error updating password", error, req);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete Account
const Delete = async (req, res) => {
  try {
    const { id } = req.user;
    await User.destroy({ where: { id } });

    logger.infoWithContext("User account deleted", req, { userId: id });

    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    logger.errorWithContext("Error deleting user account", error, req);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Verify User
const verify = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ["id", "email"] });

    if (!user) {
      logger.warnWithContext("User not found", req, { userId: req.user.id });
      return res.status(404).json({ message: "User not found" });
    }

    logger.infoWithContext("User verified successfully", req, { userId: user.id });
    res.json({ user });
  } catch (error) {
    logger.errorWithContext("Error verifying user", error, req);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Data by ID
const getUserData = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ["id", "email"] });

    if (!user) {
      logger.warnWithContext("User not found", req, { userId: req.params.id });
      return res.status(404).json({ message: "User not found" });
    }

    logger.infoWithContext("Fetched user data", req, { userId: user.id });
    res.json(user);
  } catch (error) {
    logger.errorWithContext("Error fetching user data", error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export { SignIn, SignUp, Delete, UpdatePassword, verify, getUserData };
