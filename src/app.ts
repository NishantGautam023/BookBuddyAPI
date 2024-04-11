import express from "express"

const app = express()

// Routes ==> All the api for the endPoints

app.get('/', (req, res, next) => {
    res.json({
        message: "Welcome to the Ebook API"
    })
} )


export default app;
