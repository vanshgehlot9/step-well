export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch('/api/cloudinary/upload', {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload image via internal API");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary internal API:", error);
    throw error;
  }
}

export async function deleteImageFromCloudinary(url: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      console.error("Failed to delete image via API route.");
      return false;
    }

    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
}
