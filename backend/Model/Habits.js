import { DataTypes } from "sequelize";

const createHabitModel = (sequelize) => {
  const Habit = sequelize.define(
    "Habit",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // table name
          key: "id",
        },
        onDelete: "CASCADE",
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      frequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 7,
        },
      },

      colorIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      iconTitle: {
        type: DataTypes.STRING,
        defaultValue: "default",
      },

      order: {
        type: DataTypes.INTEGER,
      },

      isArchived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // Mongo completedDays array → PostgreSQL JSONB
      completedDays: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      tableName: "Habits",
      timestamps: true, // createdAt, updatedAt
    }
  );

  return Habit;
};

export default createHabitModel;
