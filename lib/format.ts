const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  const cached = currencyFormatters.get(currency);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  currencyFormatters.set(currency, formatter);
  return formatter;
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "XXX") {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 0,
    }).format(amount);
  }

  try {
    return getCurrencyFormatter(currency).format(amount);
  } catch {
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export function formatHours(hours: number): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(hours);
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
