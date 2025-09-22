import { auth } from '../lib/firebase';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  auth?: boolean;
  headers?: Record<string, string>;
}

export async function fetchJson<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {} } = options;

  // Add auth header if needed
  if (auth && auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${idToken}`;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
  }

  // Prepare request
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  // Make request
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }
      return {} as T; // For empty responses like 204
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || data.message || 'Request failed',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('HTTP request failed:', error);
    throw new ApiError(
      0,
      'Error de conexión. Verifica tu internet.',
      error
    );
  }
}

// Convenience methods
export const httpClient = {
  get: <T>(path: string, auth = true) => 
    fetchJson<T>(path, { method: 'GET', auth }),
  
  post: <T>(path: string, body?: any, auth = true) =>
    fetchJson<T>(path, { method: 'POST', body, auth }),
  
  put: <T>(path: string, body?: any, auth = true) =>
    fetchJson<T>(path, { method: 'PUT', body, auth }),
  
  delete: <T>(path: string, auth = true) =>
    fetchJson<T>(path, { method: 'DELETE', auth }),
};

// Default export
export default httpClient;