import express from "express";

import { createBook } from "./bookController";
import multer from "multer";
import path from "node:path";



const bookRouter = express.Router();

// File store local -->
const upload = multer({
  dest: path.resolve(__dirname,'../../public/data/uploads'), // IF NOT EXIST multer will create it.
  limits: {
    fileSize: 1e7, //  1MB = 10^6 Bytes
  }
})


// routes
bookRouter.post('/',upload.fields([
  { name: "coverImage", maxCount: 1},
  {name: "file", maxCount: 1}
]), createBook)


export default bookRouter;
