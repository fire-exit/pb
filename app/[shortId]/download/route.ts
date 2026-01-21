import { api } from "@/convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";
import { getFileExtension } from "@/lib/languages";
import { getConvexHttpClient } from "@/lib/convex";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const convex = getConvexHttpClient();
  const paste = await convex.query(api.pastes.getByShortId, { shortId });

  if (!paste) {
    return new NextResponse("Paste not found", { status: 404 });
  }

  const ext = getFileExtension(paste.language);
  const filename = `paste-${shortId}.${ext}`;

  return new NextResponse(paste.content, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
