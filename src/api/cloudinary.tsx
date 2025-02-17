export async function uploadString(imageData: string) {
    if (!import.meta.env.VITE_CLODINARY_API_KEY){
        throw new Error("MISSING CLOUDINARY CONFIG!");
    }
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('api_key', import.meta.env.VITE_CLODINARY_API_KEY);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('timestamp', Date.now().toString());
    formData.append('public_id', `uploaded-${Date.now()}`);
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      return result.url as string;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }