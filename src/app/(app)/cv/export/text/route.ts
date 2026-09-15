import { auth } from "@/auth";
import { getWorkspaceForUser } from "@/lib/dashboard";
import { getCVData, renderCVAsText } from "@/lib/cv";

export async function GET() {
  const session = await auth();
  const workspace = await getWorkspaceForUser(session!.user.id);
  const data = await getCVData(workspace.id);
  const text = renderCVAsText(data);

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cv.txt"',
    },
  });
}
