import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";
const  createUser = async (req : Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body


  if (!name || !email || !password) {
    const error = createHttpError(400, "ALl fields are required");
    return next(error);
  }



  try {

    const user = await userModel.findOne({ email: email })

    if (user) {
      const error = createHttpError(400, 'User already exists with this email.')
      return next(error)
    }

  } catch (err) {
    return next(createHttpError(500, "Error while generating user"))
  }





  const hashedPassword = await bcrypt.hash(password, 10)

let newUser: User;
  try {
  newUser = await userModel.create({
      name,
      email,
      password: hashedPassword
    })
  } catch (err) {
    return next(createHttpError(500, "Error while creating user "))
  }



  try {

    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: 'HS256'
    })
    // Response
    res.status(201).json({
      accessToken: token
    })

  } catch (err) {
    return next(createHttpError(500, "Error while signing the JWT Token"))
  }

}

const loginUser = async (req: Request, res: Response, next:NextFunction ) => {

  const {email, password} = req.body

  if(!email || !password) {
    return next(createHttpError(400, "All fields are required!!"))
  }




  let existingUser: User | null
  try {
   existingUser  = await  userModel.findOne({email})

    if(!existingUser) {
      return next(createHttpError(404, "User not found."))
    }

  } catch (err) {
    return next(createHttpError(500, "Error while fetching the user"))
  }


    try {
      const isMatch = await bcrypt.compare(password, existingUser.password)
      if(!isMatch) {
        return next(createHttpError(400, "Invalid login credentials." ))
      }

    const token = sign({sub:existingUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256"
    } )

      res.status(200).json({accessToken: token})


    } catch (err) {
      return next(createHttpError(500, "Server error while verifying credentials."))
    }

}




export {createUser, loginUser}
