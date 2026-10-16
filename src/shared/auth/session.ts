// Ponto único de acesso ao token da sessão.

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

let sessionExpiredHandler: (() => void) | null = null;

export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

export function expireSession() {
  clearSession();
  sessionExpiredHandler?.();
}
