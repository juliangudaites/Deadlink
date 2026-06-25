const KEY = 'deadlink_access_code';

export function getStoredAccessCode(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessCode(code: string): void {
  localStorage.setItem(KEY, code);
}

export function clearStoredAccessCode(): void {
  localStorage.removeItem(KEY);
}