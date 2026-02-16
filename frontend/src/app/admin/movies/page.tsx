'use client';

import { useEffect, useState } from 'react';
import { moviesApi, type Movie } from '@/lib/api';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moviesApi.list().then(setMovies).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin - Movies</h1>
      <p className="mb-4 text-zinc-500">
        Đăng nhập admin để CRUD. Danh sách phim:
      </p>
      <div className="overflow-x-auto rounded border border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Year</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m.id} className="border-b border-zinc-800">
                <td className="p-3">{m.title}</td>
                <td className="p-3 text-zinc-500">{m.slug}</td>
                <td className="p-3">{m.year ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
