import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { slug?: string; previousSlug?: string };
    revalidatePath("/");
    revalidatePath("/initiatives");
    if (body.slug) {
      revalidatePath(`/initiatives/${body.slug}`);
    }
    if (body.previousSlug && body.previousSlug !== body.slug) {
      revalidatePath(`/initiatives/${body.previousSlug}`);
    }
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
