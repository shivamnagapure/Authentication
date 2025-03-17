import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected' , () => console.log("Database Connected"));// added an event, so when we get connected to database we will get massage 
    
    await mongoose.connect(`${process.env.MONGODB_URL}/Authentication` ); //provide url of database , dabase nameta 
};

export default connectDB;