import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import * as fs from "fs";
import { AuthRequest } from "../middlewares/authenticate";
import bookRouter from "./bookRouter";

const createBook = async (req: Request, res: Response, next: NextFunction) => {

  const {title, genre, description} = req.body


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
      file: bookFileUploadResult.secure_url,
      description,
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


const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // Check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }

  // check if image field is exists.

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // send files to cloudinary
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-covers",
      format: converMimeType,
    });

    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  // check if file field is exists.
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
      description: description,
    },
    { new: true }
  );

  res.json(updatedBook);
};



const listBooks = async  (req: Request, res: Response, next: NextFunction) => {
    try {
        const book = await bookModel.find().populate("author", "name");
        res.json(book)
    } catch (error) {
      return next(createHttpError(500, "Error while getting a book"))
    }

}

const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({_id: bookId}).populate("author", "name")
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
