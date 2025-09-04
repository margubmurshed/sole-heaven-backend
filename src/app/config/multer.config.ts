/* eslint-disable no-useless-escape */
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (_, file) => {
            const fileName = file.originalname
                .toLowerCase()
                .replace(/\s+/g, "-") // replace white space with dash
                .replace(/\./g, "-") // replace dot with dash
                .replace(/[^a-z0-9\-\.]/g, "") // remove alpha-numeric values
                .split("-");

            fileName.pop();

            const clearedFileName = fileName.join("-");

            const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + clearedFileName;
            return uniqueFileName;
        }
    }
})

export const multerUpload = multer({ storage });