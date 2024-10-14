import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Let Cloudinary auto-detect the file type
        });
        // remove the local file safely after uploading
        fs.unlinkSync(localFilePath);
        // File has been uploaded successfully
        return response;

    } catch (error) {
        // Log the upload error
        console.error("Cloudinary upload failed:", error);

        // Safely try to remove the local file
        try {
            fs.unlinkSync(localFilePath);

        } catch (unlinkError) {

            console.error("Error deleting local file:", unlinkError);
        }

        return null;
    }
}

export { uploadOnCloudinary };
