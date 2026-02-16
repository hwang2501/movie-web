const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function api<T>(
  path: string,
  opts?: RequestInit & { token?: string | null },
): Promise<T> {
  const { token, ...init } = opts ?? {};
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init?.headers,
  };
  const t = token ?? getToken();
  if (t) (headers as Record<string, string>)['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      token: null,
    }),
  login: (data: { email: string; password: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      token: null,
    }),
  refresh: (refreshToken: string) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      token: null,
    }),
  logout: (refreshToken: string) =>
    api<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  me: () => api<{ id: string; email: string; name: string | null; role: string }>('/auth/me'),
};

export const moviesApi = {
  list: () => api<Movie[]>('/movies'),
  bySlug: (slug: string) => api<MovieDetail>(`/movies/by-slug/${slug}`),
  byId: (id: string) => api<MovieDetail>(`/movies/${id}`),
};

export const commentsApi = {
  byMovie: (movieId: string) =>
    api<Comment[]>(`/comments/movie/${movieId}`),
  create: (movieId: string, content: string) =>
    api<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify({ movieId, content }),
    }),
};

export type Movie = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  year?: number | null;
  _count?: { episodes: number };
};

export type MovieDetail = Movie & {
  episodes: { id: string; number: number; title?: string | null; hlsPath: string; duration?: number | null }[];
  _count?: { comments: number };
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};
