import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractPublicIdFromUrl(url: string): { publicId: string; resourceType: "image" | "video" } {
  const isVideo = url.includes("/video/upload/");
  const parts = url.split("/");
  const fileWithExtension = parts.pop() || "";
  const uploadIdx = parts.indexOf("upload");
  const afterUpload = uploadIdx >= 0 ? parts.slice(uploadIdx + 1) : [];
  // Drop version segment like v1784454766 if present
  const folderSegments =
    afterUpload.length > 0 && /^v\d+$/.test(afterUpload[0])
      ? afterUpload.slice(1)
      : afterUpload;
  const filename = fileWithExtension.replace(/\.[^.]+$/, "");
  const publicId = folderSegments.length > 0 ? `${folderSegments.join("/")}/${filename}` : filename;
  return { publicId, resourceType: isVideo ? "video" : "image" };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, publicId: explicitPublicId, resourceType: explicitResourceType } = body as {
      url?: string;
      publicId?: string;
      resourceType?: "image" | "video";
    };

    if (!url && !explicitPublicId) {
      return NextResponse.json({ error: "URL or publicId is required" }, { status: 400 });
    }

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey =
      process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary credentials missing" }, { status: 500 });
    }

    const extracted = url ? extractPublicIdFromUrl(url) : null;
    const targetPublicId = explicitPublicId || extracted?.publicId || "";
    const targetResourceType = explicitResourceType || extracted?.resourceType || "image";

    if (!targetPublicId) {
      return NextResponse.json({ error: "Could not determine Cloudinary publicId" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(targetPublicId, {
      resource_type: targetResourceType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return NextResponse.json({ error: "Failed to delete media from Cloudinary" }, { status: 500 });
  }
}
