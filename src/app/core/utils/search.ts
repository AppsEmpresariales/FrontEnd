export function normalizeSearch(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesSearch(term: string, ...values: unknown[]): boolean {
  const normalizedTerm = normalizeSearch(term);
  if (!normalizedTerm) {
    return true;
  }

  return normalizeSearch(values.join(' ')).includes(normalizedTerm);
}
