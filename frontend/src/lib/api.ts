const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Chuẩn hóa thông báo lỗi từ Nest (tiếng Anh) sang tiếng Việt. */
const API_ERROR_MSG_VI: Record<string, string> = {
  'Invalid credentials': 'Email hoặc mật khẩu không đúng.',
  'Account is locked': 'Tài khoản đã bị khóa.',
  'Admin only': 'Chỉ quản trị viên mới được thực hiện thao tác này.',
};

function parseApiError(body: unknown, status: number): string {
  let raw: string | undefined;
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as { message: unknown }).message;
    if (typeof m === 'string' && m.trim()) raw = m.trim();
    else if (Array.isArray(m) && m.length) raw = m.map(String).join(', ');
  }

  if (raw) {
    const vi = API_ERROR_MSG_VI[raw];
    if (vi) return vi;
    if (/unauthorized/i.test(raw))
      return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
    return raw;
  }

  if (status === 401) {
    return 'Bạn cần đăng nhập để thực hiện thao tác này.';
  }
  if (status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  return `Lỗi máy chủ (${status}).`;
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/** Gọi trực tiếp fetch để tránh đệ quy với api() khi 401. */
async function refreshSessionOnce(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const rt = localStorage.getItem('refreshToken');
  if (!rt) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function api<T>(
  path: string,
  opts?: RequestInit & { token?: string | null; _authRetried?: boolean },
): Promise<T> {
  const { token, _authRetried, ...init } = opts ?? {};
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init?.headers,
  };
  const t = token !== undefined ? token : getToken();
  if (t) (headers as Record<string, string>)['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const shouldTryRefresh =
      res.status === 401 &&
      !_authRetried &&
      path !== '/auth/refresh' &&
      token !== null &&
      typeof window !== 'undefined' &&
      !!getToken();
    if (shouldTryRefresh) {
      const next = await refreshSessionOnce();
      if (next) {
        return api<T>(path, { ...opts, token: next, _authRetried: true });
      }
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(parseApiError(err, res.status));
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
  forgotPassword: (email: string) =>
    api<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      token: null,
    }),
  resetPassword: (token: string, newPassword: string) =>
    api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      token: null,
    }),
  google: (idToken: string, name?: string) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken, name }),
      token: null,
    }),
  me: () =>
    api<{
      id: string;
      email: string;
      name: string | null;
      imageUrl: string | null;
      googleId: string | null;
      role: string;
      createdAt: string;
    }>('/auth/me'),
  updateProfile: (body: { name?: string; imageUrl?: string | null }) =>
    api<{
      id: string;
      email: string;
      name: string | null;
      imageUrl: string | null;
      googleId: string | null;
      role: string;
      createdAt: string;
    }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export type Genre = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Movie = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  year?: number | null;
  country?: string | null;
  genres?: { genre: Genre }[];
  _count?: { episodes: number };
};

export type MovieDetail = Movie & {
  episodes: { id: string; number: number; title?: string | null; hlsPath: string; duration?: number | null }[];
  _count?: { comments: number };
};

export type ListMoviesParams = {
  q?: string;
  genre?: string;
  country?: string;
  year?: string;
};

function moviesListPath(params?: ListMoviesParams): string {
  const sp = new URLSearchParams();
  if (params?.q?.trim()) sp.set('q', params.q.trim());
  if (params?.genre?.trim()) sp.set('genre', params.genre.trim());
  if (params?.country?.trim()) sp.set('country', params.country.trim());
  if (params?.year?.trim()) sp.set('year', params.year.trim());
  const qs = sp.toString();
  return qs ? `/movies?${qs}` : '/movies';
}

export const moviesApi = {
  list: (params?: string | ListMoviesParams) => {
    const p =
      typeof params === 'string'
        ? { q: params }
        : (params ?? {});
    return api<Movie[]>(moviesListPath(p));
  },
  bySlug: (slug: string) => api<MovieDetail>(`/movies/by-slug/${slug}`),
  byId: (id: string) => api<MovieDetail>(`/movies/${id}`),
  create: (body: {
    title: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    year?: number | null;
    country?: string | null;
    genreIds?: string[];
  }) =>
    api<Movie>('/movies', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: {
      title?: string;
      slug?: string;
      description?: string | null;
      thumbnail?: string | null;
      year?: number | null;
      country?: string | null;
      genreIds?: string[];
    },
  ) =>
    api<Movie>(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<Movie>(`/movies/${id}`, {
      method: 'DELETE',
    }),
};

export const genresApi = {
  list: () => api<Genre[]>('/genres'),
  create: (body: { name: string; slug: string }) =>
    api<Genre>('/genres', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { name?: string; slug?: string }) =>
    api<Genre>(`/genres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<Genre>(`/genres/${id}`, {
      method: 'DELETE',
    }),
};

export const adminApi = {
  stats: () =>
    api<{
      users: number;
      movies: number;
      episodes: number;
      genres: number;
    }>('/admin/stats'),
  users: () =>
    api<
      {
        id: string;
        email: string;
        name: string | null;
        role: string;
        locked: boolean;
        createdAt: string;
        googleId: string | null;
      }[]
    >('/admin/users'),
  patchUserRole: (id: string, role: 'ADMIN' | 'MEMBER') =>
    api<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      locked: boolean;
    }>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  patchUserLock: (id: string, locked: boolean) =>
    api<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      locked: boolean;
    }>(`/admin/users/${id}/lock`, {
      method: 'PATCH',
      body: JSON.stringify({ locked }),
    }),
  deleteUser: (id: string) =>
    api<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

export const episodesApi = {
  streamUrl: (id: string) =>
    api<{ episodeId: string; streamUrl: string; expiresAt: number }>(
      `/episodes/${id}/stream-url`,
    ),
  byMovie: (movieId: string) =>
    api<
      {
        id: string;
        number: number;
        title?: string | null;
        hlsPath: string;
        duration?: number | null;
      }[]
    >(`/episodes/movie/${movieId}`),
  create: (body: {
    movieId: string;
    number: number;
    title?: string;
    hlsPath: string;
    duration?: number;
  }) =>
    api('/episodes', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: {
      number?: number;
      title?: string;
      hlsPath?: string;
      duration?: number;
    },
  ) =>
    api(`/episodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api(`/episodes/${id}`, {
      method: 'DELETE',
    }),
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

export const favoritesApi = {
  list: () => api<FavoriteItem[]>('/favorites'),
  add: (movieId: string) =>
    api<FavoriteItem>(`/favorites/${movieId}`, {
      method: 'POST',
    }),
  remove: (movieId: string) =>
    api<{ message: string }>(`/favorites/${movieId}`, {
      method: 'DELETE',
    }),
};

export const watchHistoryApi = {
  list: () => api<WatchHistoryItem[]>('/watch-history'),
  upsert: (episodeId: string, progress: number) =>
    api<WatchHistoryItem>('/watch-history', {
      method: 'POST',
      body: JSON.stringify({ episodeId, progress }),
    }),
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export type FavoriteItem = {
  id: string;
  createdAt: string;
  movie: Movie;
};

export type WatchHistoryItem = {
  id: string;
  progress: number;
  updatedAt: string;
  episode: {
    id: string;
    number: number;
    title?: string | null;
    movie: {
      id: string;
      slug: string;
      title: string;
    };
  };
};
