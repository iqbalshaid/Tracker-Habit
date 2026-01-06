import Habits from "../Model/Habits.js";
import  logger  from "../Middleware/logger.js";

// Get all habits
const habitsget = async (req, res) => {
  try {
    const habits = await Habits.find({ userId: req.user.id }).sort({ order: 1 });
    logger.infoWithContext("Fetched all habits", req, { userId: req.user.id });
    res.json(habits);
  } catch (error) {
    logger.errorWithContext("Error fetching habits", error, req);
    res.status(500).json({ message: "Failed to fetch habits" });
  }
};

// Get habit by ID
const habitgetbyUserId = async (req, res) => {
  try {
    const habit = await Habits.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      logger.warnWithContext("Habit not found", req, { habitId: req.params.id });
      return res.status(404).json({ message: "Habit not found" });
    }
    logger.infoWithContext("Fetched habit by ID", req, { habitId: habit._id });
    res.json(habit);
  } catch (error) {
    logger.errorWithContext("Error fetching habit", error, req);
    res.status(500).json({ message: "Error fetching habit" });
  }
};

// Create habit
const posthabit = async (req, res) => {
  try {

    const { title, name, frequency, colorIndex, iconTitle, order, isArchived, completedDays } = req.body;

    const habit = new Habits({ userId: req.user.id, title, name, frequency, colorIndex, iconTitle, order, isArchived, completedDays });
    await habit.save();

    logger.infoWithContext("Habit created successfully", req, { habitId: habit._id, userId: req.user.id });
    res.status(201).json(habit);
  } catch (error) {
    logger.errorWithContext("Error creating habit", error, req);
    res.status(500).json({ message: "Failed to create habit" });
  }
};

// Update habit
const updateHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const habit = await Habits.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) {
      logger.warnWithContext("Habit not found", req, { habitId });
      return res.status(404).json({ message: "Habit not found" });
    }

    if (!Array.isArray(habit.completedDays)) habit.completedDays = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const index = habit.completedDays.findIndex(cd => new Date(cd.date).getTime() === today.getTime());
    if (index >= 0) habit.completedDays.splice(index, 1);
    else habit.completedDays.push({ date: today, completed: true });

    await habit.save();

    logger.infoWithContext("Habit updated", req, { habitId });
    res.json(habit);
  } catch (error) {
    logger.errorWithContext("Error updating habit", error, req);
    res.status(500).json({ message: "Failed to update habit" });
  }
};

// Delete habit
const deleteHabit = async (req, res) => {
  try {
    await Habits.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    logger.infoWithContext("Habit deleted", req, { habitId: req.params.id });
    res.json({ message: "Habit deleted" });
  } catch (error) {
    logger.errorWithContext("Error deleting habit", error, req);
    res.status(500).json({ message: "Failed to delete habit" });
  }
};

// Delete all habits
const AlldeleteHabit = async (req, res) => {
  try {
    await Habits.deleteMany({ userId: req.user.id });
    logger.infoWithContext("All habits deleted", req, { userId: req.user.id });
    res.json({ message: "All habits deleted" });
  } catch (error) {
    logger.errorWithContext("Error deleting all habits", error, req);
    res.status(500).json({ message: "Failed to delete habits" });
  }
};

// Archive habit
const archieve = async (req, res) => {
  try {
    const { id } = req.params;
    const { archive } = req.body;

    const habit = await Habits.findByIdAndUpdate(id, { isArchived: archive }, { new: true });
    logger.infoWithContext("Habit archive status updated", req, { habitId: id, archive });
    res.json(habit);
  } catch (error) {
    logger.errorWithContext("Error archiving habit", error, req);
    res.status(500).json({ message: error.message });
  }
};

export { habitsget, habitgetbyUserId, posthabit, updateHabit, deleteHabit, AlldeleteHabit, archieve };
