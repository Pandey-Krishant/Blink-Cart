import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
  if (!file) {
    return null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" }, // Folder ka naam optional hai
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url ??null); // Yahan secure_url jayega
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export default  uploadOnCloudinary ;
