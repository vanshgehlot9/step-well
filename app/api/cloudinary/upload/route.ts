import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB strict limit
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const section = (formData.get("section") as string | null) || "";
    const mediaKind = (formData.get("mediaKind") as string | null) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum allowed size of 10 MB." },
        { status: 400 }
      );
    }

    const mime = (file.type || "").toLowerCase();
    const isVideo = mime.startsWith("video/");
    const isImage = mime.startsWith("image/");

    if (mediaKind === "initiative-image") {
      if (!ALLOWED_IMAGE_TYPES.has(mime)) {
        return NextResponse.json(
          { error: "Unsupported image format. Allowed formats: JPG, PNG, WEBP." },
          { status: 400 }
        );
      }
    } else if (mediaKind === "initiative-video") {
      if (!ALLOWED_VIDEO_TYPES.has(mime)) {
        return NextResponse.json(
          { error: "Unsupported video format. Only MP4 videos up to 10 MB are allowed." },
          { status: 400 }
        );
      }
    } else if (isVideo && !ALLOWED_VIDEO_TYPES.has(mime) && mime !== "video/webm" && mime !== "video/quicktime") {
      return NextResponse.json(
        { error: "Unsupported video format. Please upload MP4." },
        { status: 400 }
      );
    } else if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload an image or video." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeSection = section.replace(/[^a-zA-Z0-9_-]/g, "");
    const folder = safeSection
      ? `stepwells-renovater/cms/${safeSection}`
      : "stepwells-renovater";

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      resource_type: string;
      width?: number;
      height?: number;
      format?: string;
      bytes?: number;
      duration?: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isVideo ? "video" : "auto",
        },
        (error, res) => {
          if (error || !res) {
            reject(error || new Error("Empty response from Cloudinary"));
            return;
          }
          resolve(res);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload to Cloudinary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
