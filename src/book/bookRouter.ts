import express from "express";

import { createBook, deleteBook, getSingleBook, listBooks, updateBook } from "./bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";



const bookRouter = express.Router();

// File store local -->
const upload = multer({
  dest: path.resolve(__dirname,'../../public/data/uploads'), // IF NOT EXIST multer will create it.
  limits: {
    fileSize: 1e7, //  1MB = 10^6 Bytes
  }
})


// routes
bookRouter.post('/',
  authenticate,
  upload.fields([
  { name: "coverImage", maxCount: 1},
  {name: "file", maxCount: 1}
]), createBook)


bookRouter.patch('/:bookId',
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1},
    {name: "file", maxCount: 1}
  ]), updateBook)

bookRouter.get('/', listBooks)
bookRouter.get('/:bookId', getSingleBook)
bookRouter.delete('/:bookId', authenticate, deleteBook)
export default bookRouter;
