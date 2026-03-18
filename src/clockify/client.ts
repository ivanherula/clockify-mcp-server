const BASE_URL = 'https://api.clockify.me/api/v1';

export class ClockifyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ClockifyApiError';
  }
}

export class ClockifyClient {
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    this.headers = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let code = 'UNKNOWN';
      let message = response.statusText;
      try {
        const err = (await response.json()) as { code?: string; message?: string };
        if (err.code) code = String(err.code);
        if (err.message) message = err.message;
      } catch {
        // ignore parse errors
      }
      throw new ClockifyApiError(response.status, code, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}
