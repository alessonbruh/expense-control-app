// Ponto único de acesso aos dados da sessão.

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface SessionUser {
  name: string;
  email: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSessionUser(): SessionUser | null {
  try {
    const value = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
    return typeof value?.name === 'string' && typeof value?.email === 'string'
      ? { name: value.name, email: value.email }
      : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ name: user.name, email: user.email }),
  );
}

export function startSession(token: string, user: SessionUser) {
  setToken(token);
  setSessionUser(user);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

let sessionExpiredHandler: (() => void) | null = null;

export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Sua sessão expirou. Entre novamente.');
    this.name = 'SessionExpiredError';
  }
}

export function expireSession() {
  const hadSession = getToken() !== null;
  clearSession();
  if (hadSession) sessionExpiredHandler?.();
}
