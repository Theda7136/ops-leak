"use server";

import { submitDailyReport } from "@/lib/reports";
import type { ReportActionResult } from "@/types";

export async function createDailyReport(
  input: unknown,
): Promise<ReportActionResult> {
  return submitDailyReport(input);
}
