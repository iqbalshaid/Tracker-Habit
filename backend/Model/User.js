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
//jab class wala model banta hai toh 
// export type AttendanceCreationAttributes = Optional<
//   AttendanceAttributes,
//   "attendanceId" | "status" | "workingHours" | "createdAt" | "updatedAt"
// >;
//jo optional hai uska matlab ye hota hai ki jab hum ye model ko backend ke create karenge toh "or" logic me jo name 
// hai agar oh create ke time nhi vhi rehega toh vhi ye model backend me create hoga