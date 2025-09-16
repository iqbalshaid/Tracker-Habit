import { DataTypes } from "sequelize";

const createUserModel=(sequelize)=>{
 const User=sequelize.define("User",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate:{isEmail:true}
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
   
 });
 return User;
}

export default createUserModel;