import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors"
import { config } from "./config/config";

const app = express()

app.use(cors({
    origin: config.frontendDomain,
}))
app.use(express.json()) // use the Middleware for JSON Parsing


// Routes ==> All the api for the endPoints

app.get('/', (req, res, next) => {


    res.json({
        message: "Welcome to the Ebook API"
    })
} )


app.use("/api/users",userRouter)
app.use('/api/books', bookRouter)



// Global Error Handlers
app.use(globalErrorHandler)

export default app;
