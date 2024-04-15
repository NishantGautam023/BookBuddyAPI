import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express()

// Routes ==> All the api for the endPoints

app.get('/', (req, res, next) => {


    res.json({
        message: "Welcome to the Ebook API"
    })
} )

app.use(express.json()) // use the Middleware for JSON Parsing
app.use("/api/users",userRouter)
app.use('/api/books', bookRouter)



// Global Error Handlers
app.use(globalErrorHandler)

export default app;
