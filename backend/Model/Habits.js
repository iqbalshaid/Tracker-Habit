import mongoose from "mongoose";
const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  Name: { type: String, required: true },
  frequency: { type: Number, min: 1, max: 7, default: 1 },
  colorIndex: { type: Number, default: 0 },
  iconTitle: { type: String, default: "default" },
  order: { type: Number },
  isArchived: { type: Boolean, default: false },
  completedDays: [
    {
      date: { type: Date, required: true },
      completed: { type: Boolean, default: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.Habits || mongoose.model("Habit", habitSchema);