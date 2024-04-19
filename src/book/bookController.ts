import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import * as fs from "fs";
import { AuthRequest } from "../middlewares/authenticate";
import bookRouter from "./bookRouter";

const createBook = async (req: Request, res: Response, next: NextFunction) => {

  const {title, genre} = req.body


  console.log("files", req.files);

  const files = req.files as { [filename: string]: Express.Multer.File[] };

  if (!files.coverImage || !files.file) {
    return next(createHttpError(400, "Cover image or book file is missing."));
  }

  const coverImage = files.coverImage[0];
  const coverImageMimeType = coverImage.mimetype.split('/').at(-1);
  const coverImageFilePath = path.resolve(__dirname, '../../public/data/uploads', coverImage.filename);

  const bookFile = files.file[0];
  const bookFileType = bookFile.mimetype.split('/').at(-1);
  const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFile.filename);

  try {
    const coverImageUploadResult = await cloudinary.uploader.upload(coverImageFilePath, {
      resource_type: "image",
      public_id: coverImage.filename.replace(/\.[^/.]+$/, ""), // Remove extension from filename
      folder: 'book-covers',
      format: coverImageMimeType
    });

    const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw", // 'raw' for non-image files
      public_id: bookFile.filename.replace(/\.[^/.]+$/, ""),
      folder: "book-pdfs",
      format: bookFileType
    });

    const _req = req as AuthRequest



    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: coverImageUploadResult.secure_url,
      file: bookFileUploadResult.secure_url
    })

    // Delete temp files
  await  fs.promises.unlink(coverImageFilePath);
    await  fs.promises.unlink(bookFilePath);


    res.status(201).json({
      id: newBook._id,
      message: "Book created",
      coverImageUrl: coverImageUploadResult.secure_url,
      bookFileUrl: bookFileUploadResult.secure_url
    });
  } catch (err) {
    console.error('Upload Error:', err);
    return next(createHttpError(500, 'Error while uploading the files.'));
  }
};


const updateBook = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const { title, genre } = req.body; // // Destructure 'title' and 'genre' from the request body for the update.
    const bookId = req.params.bookId; //  retrieval of bookId from route parameters
    const book = await bookModel.findOne({ _id: bookId }) //   // Find the book by its ID in the database

    if (!book) {
      return next(createHttpError(404, "Book not found"))
    }

    const _req = req as AuthRequest // // Cast the request to 'AuthRequest' to use the custom 'userId' property for authorization

    // check Access
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "You cannot update other's book"))
    }

    const files = req.files as { [filename: string]: Express.Multer.File[] } // // Assume 'req.files' is populated by Multer middleware handling file uploads

    let completeCoverImage = ""; // Check if image field exists

    // ......>CHECK IF COVER FIELD EXISTS
    if (files.coverImage) { // In postman, if no one updates coverImage and file, the already image and file no need to update, only update if someone sends.

      const filename = files.coverImage[0].filename;
      const coverMimeType = files.coverImage[0].mimetype.split('/').at(-1)

      const filePath = path.resolve(
        __dirname,
        '../../public/data/uploads' + filename
      )

      completeCoverImage = filename;

        const uploadResult = await cloudinary.uploader.upload(filePath, {
          filename_override: completeCoverImage,
          folder: "book-covers",
          format: coverMimeType,
        });

        completeCoverImage = uploadResult.secure_url;

        // Delete the temporary file
        await fs.promises.unlink(filePath);
      }


    // .....CHECK IF FILE FIELD EXISTS
    let completeFileName = "";

    if (files.file) {
      const bookFilePath = path.resolve(
        __dirname,
        '../../public/data/uploads' + files.file[0].filename
      )

      const bookFileName = files.file[0].filename;
      completeFileName =  bookFileName

      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: completeFileName,
        folder: "book-pdfs",
        format: "pdf",
      })

      completeFileName = uploadResultPdf.secure_url
      await fs.promises.unlink(bookFilePath)

    }

      // Update the book details with new title, genre, and/or cover image
      const updatedBook = await bookModel.findOneAndUpdate({
        _id: bookId,
      },
        {
          title: title,
          genre: genre,
          coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
          file: completeFileName ? completeFileName : book.file, // else use the old file name
        },
        {new: true}
        )


      // Send a response back to the client
      res.status(200).json({
        message: "Book updated successfully",
        updatedBook,
      });

    }

   catch (err) {
    console.error('Error updating book:', err);
    next(createHttpError(500, 'Error updating book'));
  }

}


const listBooks = async  (req: Request, res: Response, next: NextFunction) => {
    try {
        const book = await bookModel.find();
        res.json(book)
    } catch (error) {
      return next(createHttpError(500, "Error while getting a book"))
    }

}

const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({_id: bookId})
    if (!book) {
      return next(createHttpError(404, "Error Book not found"))
    }

    return res.json(book);

  } catch (err) {
    return next(createHttpError(500, "Error while getting a book"))
  }

}


const deleteBook = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const bookId = req.params.bookId;
      const book = await  bookModel.findOne({_id: bookId})

      if(!book) {
        return next(createHttpError(404, "Book not found"))
      }

      // Check if the user has access to delete the Book
      const _req = req as AuthRequest
      if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You cannot update other's book"))
      }


      const coverFileSplits = book.coverImage.split('/');
      const coverImagePublicId = coverFileSplits.at(-2) + '/'  + (coverFileSplits.at(-1)?.split('.').at(-2))

      const bookFileSplits = book.file.split('/');
      const bookFilePublicId = bookFileSplits.at(-2) + "/" +  bookFileSplits.at(-1);


      await cloudinary.uploader.destroy(coverImagePublicId); // Delete cover
      await cloudinary.uploader.destroy(bookFilePublicId, {
        resource_type: "raw" // For pdf option only
      })
      await  bookModel.deleteOne({_id: bookId}) // Deletes the record from the database

      return res.sendStatus(204) // When deleting only send code status no Data.
    } catch (error) {
      return next(createHttpError(500, "Error in Deleting Book"))
    }










}

  export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
