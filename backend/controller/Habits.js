import { Habit } from "../db/dbConnection.js";
import  logger  from "../Middleware/logger.js";

// Get all habits
const habitsget = async (req, res) => {
  try {
    const habits = await Habit.findAll({
      where: { userId: req.user.id },
      order: [["order", "ASC"]],
    });

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
    const habit = await Habit.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json(habit);
  } catch (error) {
    logger.errorWithContext("Error fetching habit", error, req);
    res.status(500).json({ message: "Error fetching habit" });
  }
};

// Create habit
const posthabit = async (req, res) => {
  try {
    const {
      title,
      name,
      frequency,
      colorIndex,
      iconTitle,
      order,
      isArchived,
      completedDays,
    } = req.body;

    const habit = await Habit.create({
      userId: req.user.id,
      title,
      name,
      frequency,
      colorIndex,
      iconTitle,
      order,
      isArchived,
      completedDays,
    });

    logger.infoWithContext("Habit created successfully", req, {
      habitId: habit.id,
      userId: req.user.id,
    });

    res.status(201).json(habit);
  } catch (error) {
    logger.errorWithContext("Error creating habit", error, req);
    res.status(500).json({ message: "Failed to create habit" });
  }
};



// Update habit
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    let completedDays = habit.completedDays || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const index = completedDays.findIndex(
      (cd) => new Date(cd.date).getTime() === today.getTime()
    );

    if (index >= 0) {
      completedDays.splice(index, 1);
    } else {
      completedDays.push({ date: today, completed: true });
    }

    habit.completedDays = completedDays;
    await habit.save();

    logger.infoWithContext("Habit updated", req, { habitId: habit.id });
    res.json(habit);
  } catch (error) {
    logger.errorWithContext("Error updating habit", error, req);
    res.status(500).json({ message: "Failed to update habit" });
  }
};

// Delete habit
const deleteHabit = async (req, res) => {
  try {
    const deleted = await Habit.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json({ message: "Habit deleted" });
  } catch (error) {
    logger.errorWithContext("Error deleting habit", error, req);
    res.status(500).json({ message: "Failed to delete habit" });
  }
};


// Delete all habits
const AlldeleteHabit = async (req, res) => {
  try {
    await Habit.destroy({
      where: { userId: req.user.id },
    });

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

    const habit = await Habit.findOne({
      where: { id, userId: req.user.id },
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    habit.isArchived = archive;
    await habit.save();

    res.json(habit);
  } catch (error) {
    logger.errorWithContext("Error archiving habit", error, req);
    res.status(500).json({ message: error.message });
  }
};


export {
  habitsget,
  habitgetbyUserId,
  posthabit,
  updateHabit,
  deleteHabit,
  AlldeleteHabit,
  archieve,
};

