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

        // File has been uploaded successfully
        console.log("File uploaded on Cloudinary:", response.url);
        return response;

    } catch (error) {
        // Log the upload error
        console.error("Cloudinary upload failed:", error);

        // Safely try to remove the local file
        try {
            fs.unlinkSync(localFilePath);
            console.log(`Local file ${localFilePath} deleted`);
        } catch (unlinkError) {
            console.error("Error deleting local file:", unlinkError);
        }

        return null;
    }
}

export { uploadOnCloudinary };
