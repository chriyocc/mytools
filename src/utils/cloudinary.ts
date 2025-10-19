/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary image URL
 * @returns public_id or null if extraction fails
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // Get everything after /upload/
    const afterUpload = parts[1];
    
    // Remove version number (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Failed to extract public_id:', error);
    return null;
  }
}

/**
 * Upload image to Cloudinary
 * @param file - Image file to upload
 * @param folder - Cloudinary folder name
 * @returns Object containing secure_url and public_id
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'project_imgs'
): Promise<{ secure_url: string; public_id: string }> {
  // Get signature from backend
  const sigResponse = await fetch('http://localhost:3000/api/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });

  const { signature, timestamp, cloudName, apiKey, folder: folderName, preset } = await sigResponse.json();

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', apiKey);
  formData.append('folder', folderName);
  formData.append('upload_preset', preset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.log(response);
    
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  const publicId = getPublicIdFromUrl(data.secure_url);

  return {
    secure_url: data.secure_url,
    public_id: publicId || '',
  };
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public_id
 * @returns Success boolean
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  const response = await fetch('http://localhost:3000/api/delete/', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      public_id: publicId,
    }),
  });

  const data = await response.json();

  if (data.success) {
    return true;
  } else {
    throw new Error(data.error || 'Delete failed');
  }
}