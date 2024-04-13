import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express()

// Routes ==> All the api for the endPoints

app.get('/', (req, res, next) => {


    res.json({
        message: "Welcome to the Ebook API"
    })
} )

app.use("/api/users",userRouter)



// Global Error Handlers
app.use(globalErrorHandler)

export default app;
