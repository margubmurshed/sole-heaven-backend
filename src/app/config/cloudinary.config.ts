/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from "cloudinary";
import { envVariables } from "./env";
import httpStatus from "http-status-codes";
import stream from "stream";
import AppError from "../errorHelpers/AppError";

cloudinary.config({
    cloud_name: envVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVariables.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVariables.CLOUDINARY.CLOUDINARY_API_SECRET
})

export const cloudinaryUpload = cloudinary;

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const fileWithExtension = url.split("/").pop() || "";  // gets the last part
        const public_id = fileWithExtension.split(".")[0];
        if (public_id) {
            await cloudinary.uploader.destroy(public_id)
        }
    } catch (error) {
        console.error("Cloudinary deletion error:", error); // ✅ Better debugging
        throw new AppError("Cloudinary deletion error", httpStatus.BAD_REQUEST);
    }
}

export const uploadBufferToCloudinary = async (buffer: Buffer, fileName: string) => {
    console.log(buffer)
    try {
        const result = await new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;

            const uploadStream = cloudinary.uploader.upload_stream({
                resource_type: "auto",
                public_id,
                folder: "pdf"
            }, (error, result) => {
                if(error) return reject(error);
                resolve(result)
            })

            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);
            bufferStream.pipe(uploadStream);
        })

        return result
    } catch (error: any) {
        throw new AppError(`Error uploading file - ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR)
    }
}