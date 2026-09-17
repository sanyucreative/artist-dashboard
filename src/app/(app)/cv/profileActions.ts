"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in");

  const name = String(formData.get("name") ?? "").trim() || null;
  const disciplinesRaw = String(formData.get("disciplines") ?? "");
  const disciplines = disciplinesRaw
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, disciplines: JSON.stringify(disciplines) },
  });
  revalidatePath("/cv");
}
