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

export class AuthService {
  private baseUrl = `${API_URL}/user`;

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

  async register(data: RegisterData): Promise<{ message: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // A API recebe a senha em texto no campo passwordHash e gera o hash
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          passwordHash: data.password,
        }),
      });
      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || 'Erro ao criar conta');
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  }
}
