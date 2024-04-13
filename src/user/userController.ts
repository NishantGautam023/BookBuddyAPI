import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const  createUser = async (req : Request, res: Response, next: NextFunction) => {
  const {name, email, password} = req.body

  // Validation
  if(!name || !email || !password) {
    const error = createHttpError(400, "ALl fields are required");
    return next(error); // Global Error Handler will send the response
  }

  // Process

  // Response

  res.json({
    message: "User Created!"
  })
}




export {createUser}
