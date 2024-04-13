import mongoose from "mongoose";
import { User } from "./userTypes";
// Need to create Schema for our database,

const userSchema = new mongoose.Schema<User>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,

  }

}, {timestamps: true})

// users ==> Collection will be named plural of the model, to change the name, we can give third parameter like 'authors')
export default mongoose.model<User>('User', userSchema)
