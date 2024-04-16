import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
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
    res.json({
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
