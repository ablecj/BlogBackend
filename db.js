import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
   dbName: process.env.DB_NAME
}).then(
    ()=> {
        console.log("Connected to MongoDB");
    }
).catch((err)=> {
    console.log('error connecting to the MongoDB' + err);
})