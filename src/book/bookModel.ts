import mongoose from "mongoose";
import { Book } from "./bookTypes";

const bookSchema = new mongoose.Schema<Book>({
  title: {
    type: "string",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // This is how we connect two collections
    required: true,
  },
  coverImage : {
    type: String,
    required: true,
  },
  file: {
    required: true,
    type: String,
  },
  genre: {
    type: String,
    required: true,
  },
  publicationDate: {
    type: Date,
  }
}, {
  timestamps: true,
})

export default mongoose.model<Book>('Book', bookSchema);
