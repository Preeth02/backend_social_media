import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var localFilePath1;
const uploadOnCloudinary = async (localFilePath) => {
    localFilePath1 = localFilePath;
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        // console.log("RESPONSE:",response)
        return response
    } catch {
        fs.unlinkSync(localFilePath) //removes the locally saved temporary file if the upload operation got falied..
        return null;
    }
}
export { uploadOnCloudinary, localFilePath1 }