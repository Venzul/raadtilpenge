import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../lib/admin-auth";
import { getAnalyticsSummary } from "../../../lib/analytics-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("analytics summary failed", error);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 },
    );
  }
}
