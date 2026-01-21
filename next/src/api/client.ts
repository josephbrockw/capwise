import config from '@/config';

export interface APIResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export class APIError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errors = errors;
  }
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(
    includeAuth: boolean = false,
    customHeaders?: Record<string, string>
  ): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: APIResponse<T>;

    try {
      data = await response.json();
    } catch {
      // If response is not JSON, throw a generic error
      throw new APIError(
        response.statusText || 'An error occurred',
        response.status
      );
    }

    if (!response.ok) {
      throw new APIError(
        data.error || data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data.data as T;
  }

  async get<T>(
    endpoint: string,
    authenticated: boolean = false,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(authenticated, customHeaders),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    authenticated: boolean = false,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(authenticated, customHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    authenticated: boolean = false,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(authenticated, customHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    authenticated: boolean = false,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(authenticated, customHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(
    endpoint: string,
    authenticated: boolean = false,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(authenticated, customHeaders),
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new APIClient(config.apiBaseUrl);
