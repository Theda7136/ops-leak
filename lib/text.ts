export const LIMITS = {
  name: 120,
  clientName: 120,
  supervisor: 80,
  report: 8_000,
  summary: 400,
  action: 500,
  hours: 24 * 31,
  money: 1_000_000_000,
} as const;

export function cleanText(value: string, max: number): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function noonUtcFromDateInput(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

export function fenceUntrusted(value: string): string {
  return value.replaceAll("<REPORTE>", "< REPORTE>").replaceAll("</REPORTE>", "< /REPORTE>");
}

export function safeErrorText(error: unknown): string {
  const message = error instanceof Error ? error.message : "Error desconocido";

  return message
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/xai-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/grok_[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .slice(0, 300);
}
