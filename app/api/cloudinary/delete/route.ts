import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials missing' }, { status: 500 });
    }

    // Extract public_id from Cloudinary URL
    // Typical URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_name.jpg
    const parts = url.split('/');
    const fileWithExtension = parts.pop() || '';
    const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/');
    const filename = fileWithExtension.split('.')[0];
    
    const publicId = folderPath ? `${folderPath}/${filename}` : filename;

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
