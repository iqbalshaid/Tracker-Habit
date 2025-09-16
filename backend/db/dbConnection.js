import { Sequelize } from "sequelize";
import createUserModel from "../Model/User.js";
let User=null;
export const dbConnection = async (database, username, password) => {
  const sequelize = new Sequelize(database, username, password, {
    host: "localhost",
    dialect: "postgres",
  });
  try {
    await sequelize.authenticate();
    User=await createUserModel(sequelize);
    await sequelize.sync({alter:true}); //if we not use sequelize.sync then we have use migration for table create in postgresql because sequelize.sync
    //automatically create the table with the use of model
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export {User};