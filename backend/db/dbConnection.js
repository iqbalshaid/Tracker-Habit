import { Sequelize } from "sequelize";
import createUserModel from "../Model/User.js";
import createHabitModel from "../Model/Habits.js";

let User = null;
let Habit = null;

export const dbConnection = async (database, username, password) => {
  const sequelize = new Sequelize(database, username, password, {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  });

  try {
    await sequelize.authenticate();

    // 🔹 initialize models
    User = createUserModel(sequelize);
    Habit = createHabitModel(sequelize);

    // 🔹 associations
    User.hasMany(Habit, { foreignKey: "userId", onDelete: "CASCADE" });
    Habit.belongsTo(User, { foreignKey: "userId" });

    // 🔹 sync
    await sequelize.sync({ alter: true });

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { Sequelize, User, Habit };
