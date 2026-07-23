export async function uploadToCloudinary(fileUri: string): Promise<string | null> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary environment variables not set');
    return null;
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const data = new FormData();

  // React Native fetch with FormData needs this structure for files
  const filename = fileUri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  data.append('file', {
    uri: fileUri,
    name: filename,
    type
  } as any);

  data.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        // 'Content-Type': 'multipart/form-data' <- removed because React Native fetch auto-generates the boundary
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      return null;
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload exception:', error);
    return null;
  }
}
