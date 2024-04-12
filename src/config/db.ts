import  mongoose from "mongoose";
import {config} from "./config";

const connectDatabase = async () => {


  try {

    mongoose.connection.on('connected', () => {
      console.log("Connected to database successfully")
    })

    mongoose.connection.on('error', (err) => {
      console.log("Error in connecting to database",err)
    })


    await mongoose.connect(config.databaseUrl as string)


  } catch (err) {
    console.error("Failed to connect to database", err)
    process.exit(1) // Stopping the server when database fails
  }

}

export default connectDatabase
