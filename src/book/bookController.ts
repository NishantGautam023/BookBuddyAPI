import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import * as fs from "fs";

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

    console.log('Upload Results:', coverImageUploadResult, bookFileUploadResult);

    const newBook = await bookModel.create({
      title,
      genre,
      author: '661c78673af9f43e5fc9a303',
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

export { createBook };
