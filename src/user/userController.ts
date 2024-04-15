import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
const  createUser = async (req : Request, res: Response, next: NextFunction) => {
  const {name, email, password} = req.body

  // Validation
  if(!name || !email || !password) {
    const error = createHttpError(400, "ALl fields are required");
    return next(error); // Global Error Handler will send the response
  }

  // Database Call
  const user = await userModel.findOne({email: email}) // In js if key and value same we can only write key also. i.e email.

  if(user) {
    const error = createHttpError(400, 'User already exists with this email.')
    return next(error)
  }

  // Password --> Hash

  const hashedPassword = await bcrypt.hash(password, 10)

const newUser = await userModel.create({
  name,
  email,
  password: hashedPassword
})

  // Token Generation JWT

 const token = sign({sub: newUser._id}, config.jwtSecret as string, {expiresIn: "7d",
 algorithm: 'HS256'
 })

  // Process

  // Response

  res.json({
   accessToken: token
  })
}




export {createUser}
