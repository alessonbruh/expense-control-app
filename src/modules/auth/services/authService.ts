const API_URL = import.meta.env.VITE_API_URL;

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private baseUrl = `${API_URL}/user`;

  async auth(data: LoginData) {
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
}
