import { cookies } from "next/headers";

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("rtp_admin")?.value === "1";
}
