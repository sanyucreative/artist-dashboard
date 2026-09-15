import PDFDocument from "pdfkit";
import { auth } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { getCVData, formatEntryLine } from "@/lib/cv";

// pdfkit reads Node built-ins (fs, Buffer) to embed its default fonts.
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const data = await getCVData(workspace.id);

  const doc = new PDFDocument({ margin: 54 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const name = data.workspace.user.name ?? data.workspace.name;
  doc.fontSize(20).text(name, { align: "left" });
  doc.moveDown(1);

  for (const group of data.grouped) {
    doc.fontSize(13).fillColor("#171717").text(group.category.toUpperCase());
    doc.moveDown(0.3);
    for (const e of group.entries) {
      doc.fontSize(10).fillColor("#404040").text(`•  ${formatEntryLine(e)}`);
    }
    doc.moveDown(0.8);
  }

  doc.end();
  const buffer = await done;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="cv.pdf"',
    },
  });
}
