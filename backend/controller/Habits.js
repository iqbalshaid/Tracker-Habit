import Habits from "../Model/Habits.js";

// Get all habits for the authenticated user
const habitsget = async (req, res) => {
  try {
    const habits = await Habits.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(habits);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch habits" });
  }
};

// Get single habit by id for authenticated user
const habitgetbyUserId = async (req, res) => {
  try {
    const habit = await Habits.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching habit" });
  }
};

// Create a new habit
const posthabit = async (req, res) => {
  try {
     console.log("kio");
    const { title,name, frequency, colorIndex, iconTitle, order,isArchived,completedDays} = req.body;
  

    const habit = new Habits({ userId: req.user.id, title,name, frequency, colorIndex, iconTitle, order,isArchived,completedDays });
    
    await habit.save();
    console.log("lop");
    res.status(201).json(habit);
  } catch (error) {
    console.error("Habit save error:", error);
    return res.status(500).json({ message: "Failed to create habit" });
  }
};

// Update habit by id
const updateHabit = async (req, res) => {
try {
    const habitId = req.params.id;

    // Find habit
    const habit = await Habits.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    // Ensure completedDays array exists
    if (!Array.isArray(habit.completedDays)) habit.completedDays = [];

    // Backend-only: Automatically toggle today's completion
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingIndex = habit.completedDays.findIndex(
      (cd) => new Date(cd.date).getTime() === today.getTime()
    );

    if (existingIndex >= 0) {
      // Remove today's completion
      habit.completedDays.splice(existingIndex, 1);
    } else {
      // Add today's completion
      habit.completedDays.push({ date: today, completed: true });
    }

    // Save habit
    await habit.save();

    // Return updated habit
    res.json(habit);
  } catch (error) {
    console.error("Failed to update habit:", error);
    return res.status(500).json({ message: "Failed to update habit" });
  }
};

// Delete habit by id
const deleteHabit = async (req, res) => {
  try {
    await Habits.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Habit deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete habit" });
  }
};
const AlldeleteHabit = async (req, res) => {
  try {
    
   await Habits.deleteMany({ userId: req.user.id });
    console.log(req.user._id);
    res.json({ message: "Habit deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete habit" });
  }
};
const archieve = async(req,res)=>{
   const { id } = req.params;
  const { archive } = req.body; // true/false
  
  try {
    const habit = await Habits.findByIdAndUpdate(
      id,
      { isArchived: archive },
      { new: true }
    );
    console.log(archive);
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export { updateHabit, deleteHabit, posthabit, habitgetbyUserId, habitsget,AlldeleteHabit,archieve };
