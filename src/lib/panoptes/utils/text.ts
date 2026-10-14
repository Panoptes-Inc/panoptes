const MOJIBAKE_PATTERN = /[繧縺荳菫譛螟蟾逡遶讒]/;

export function looksMojibake(value: string | null | undefined): boolean {
  if (!value) return false;
  const matches = value.match(MOJIBAKE_PATTERN);
  return Boolean(matches && matches.length > 0);
}

export function safeText(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  return looksMojibake(value) ? fallback : value;
}
