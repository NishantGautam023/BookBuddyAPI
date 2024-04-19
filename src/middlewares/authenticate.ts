import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if(!authHeader) {
    return next(createHttpError(401, "Authorization token is required"))
  }

  if(!authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, "Authorization format is 'Bearer [token]'"));
  }

  const token = req.header('Authorization');
  if(!token) {
    return next(createHttpError(401, "Bearer token not found"))
  }

  if(!config.jwtSecret) {
    console.log("JWT Secret is undefined.")
    return next(createHttpError(500, "Server configuration error"))
  }


  try {
    const parsedToken = token.split(' ')[1]
    const decoded = verify(parsedToken, config.jwtSecret as string)
    console.log('Decoded Token', decoded)

    const _req = req as AuthRequest
    _req.userId = decoded.sub as string

    next();
  } catch (err: any) {
    console.error('JWT error:', err.message)
    let errorMessage = "Invalid token";
    if (err.name === 'TokenExpiredError') {
      errorMessage = "Token expired";
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = "Invalid token";
    }
    return next(createHttpError(401, errorMessage))
  }

}




export default authenticate;
