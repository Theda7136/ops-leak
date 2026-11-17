"use server";

import { createProject } from "@/lib/projects";
import type { ReportActionResult } from "@/types";

export async function createProjectAction(
  input: unknown,
): Promise<ReportActionResult> {
  return createProject(input);
}
