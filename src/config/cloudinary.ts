import {v2 as cloudinary} from 'cloudinary';
import { config } from "./config";


cloudinary.config({
  cloud_name: config.Cloudinary_cloud,
  api_key: config.Cloudinary_API_KEY,
  api_secret: config.Cloudinary_API_SECRET
});

export default cloudinary
