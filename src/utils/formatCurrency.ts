function parseStrict(value: number | string): number {
  if (typeof value === 'number') return value;
  const cleaned = value.trim().replace(/[\s,€$£¥]/g, '');
  if (cleaned === '' || !/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

export function formatCurrency(value: number | string, currency: string = '€'): string {
  const num = parseStrict(value);
  if (!Number.isFinite(num)) return `${currency}0`;
  return `${currency}${num.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

export function formatCurrencyExact(value: number | string, currency: string = '€'): string {
  const num = parseStrict(value);
  if (!Number.isFinite(num)) return `${currency}0.00`;
  return `${currency}${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
