import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../../lib/admin-auth";
import { getTabAnalytics } from "../../../../../lib/analytics-server";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ section: string; tabKey: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section, tabKey } = await params;

  try {
    const data = await getTabAnalytics(section, tabKey);
    if (!data) {
      return NextResponse.json({ error: "Tab not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("tab analytics failed", error);
    return NextResponse.json(
      { error: "Failed to load tab analytics" },
      { status: 500 },
    );
  }
}
