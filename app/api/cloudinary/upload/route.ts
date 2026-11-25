import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const section = (formData.get("section") as string | null) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
          resource_type: "auto",
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
