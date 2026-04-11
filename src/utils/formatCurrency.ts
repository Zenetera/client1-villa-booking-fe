export function formatCurrency(value: number | string, currency: string = '€'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return `${currency}0`;
  return `${currency}${num.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

export function formatCurrencyExact(value: number | string, currency: string = '€'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return `${currency}0.00`;
  return `${currency}${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
