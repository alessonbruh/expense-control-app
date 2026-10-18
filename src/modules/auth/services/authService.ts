import { expireSession } from '../../../shared/auth/session';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  // Exibidos uma única vez: a API guarda só o hash
  recoveryCodes: string[];
}

export interface ResetPasswordData {
  email: string;
  recoveryCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  remainingRecoveryCodes: number;
}

export interface GenerateRecoveryCodesResponse {
  message: string;
  recoveryCodes: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// Mesmas regras do schema de criação de usuário da API
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  private baseUrl = `${API_URL}/user`;

  private async post<T>(path: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || 'Erro ao processar requisição');
      return result as T;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  // Rotas que exigem login: 401 encerra a sessão
  private async authenticated<T>(
    path: string,
    method: string,
    token: string | null,
    body?: unknown,
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();

      if (response.status === 401) expireSession();
      if (!response.ok)
        throw new Error(result.message || 'Erro ao processar requisição');
      return result as T;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  async auth(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Erro no login');
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }

  async logout(token: string, allDevices = false): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${allDevices ? 'logout-all' : 'logout'}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok && response.status !== 401) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || 'Erro ao sair da conta');
    }
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    // A API recebe a senha em texto no campo passwordHash e gera o hash
    return this.post<RegisterResponse>('', {
      name: data.name,
      email: data.email,
      passwordHash: data.password,
    });
  }

  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>('/reset-password', data);
  }

  async getRecoveryCodesStatus(
    token: string | null,
  ): Promise<{ remaining: number }> {
    return this.authenticated('/recovery-codes', 'GET', token);
  }

  async generateRecoveryCodes(
    token: string | null,
    password: string,
  ): Promise<GenerateRecoveryCodesResponse> {
    return this.authenticated('/recovery-codes', 'POST', token, { password });
  }
}
