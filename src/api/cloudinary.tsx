import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: import.meta.env.VITE_CLOUINARY_NAME, 
    api_key: import.meta.env.VITE_CLOUDINARY_API_KEY, 
    api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET
});

export async function UploadImage(file: string) {
    return (await cloudinary.uploader.upload(file)).url;
}