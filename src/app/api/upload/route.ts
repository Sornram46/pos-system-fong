import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
const BUCKET = "pos_image";
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large" }, { status: 413 });

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, Buffer.from(arrayBuffer), {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // ถ้า bucket ตั้งเป็น public
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

    // ถ้า bucket เป็น private ใช้ signed URL (เลือกอย่างใดอย่างหนึ่ง)
    // const { data: signed } = await supabaseAdmin.storage
    //   .from(BUCKET)
    //   .createSignedUrl(filename, 60 * 60);
    // const url = signed?.signedUrl;

    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    console.error("Upload API error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}