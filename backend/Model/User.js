import mongoose from "mongoose";

// Nested schema for locale


const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.User || mongoose.model("User", UserSchema);
