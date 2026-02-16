'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { moviesApi, type Movie } from '@/lib/api';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    moviesApi
      .list()
      .then(setMovies)
      .catch(() => setError('Không tải được danh sách phim'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-zinc-400">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Phim mới</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((m) => (
          <Link
            key={m.id}
            href={`/movie/${m.slug}`}
            className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition hover:border-amber-500/50"
          >
            <div className="aspect-video bg-zinc-800">
              {m.thumbnail ? (
                <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-zinc-600">
                  🎬
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium line-clamp-2 group-hover:text-amber-400">{m.title}</h3>
              {m.year && <p className="text-sm text-zinc-500">{m.year}</p>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
