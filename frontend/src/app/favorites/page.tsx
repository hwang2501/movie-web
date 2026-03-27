'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { favoritesApi, type FavoriteItem } from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    favoritesApi
      .list()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Tải danh sách thất bại'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-zinc-800" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60"
            >
              <div className="aspect-video bg-zinc-800" />
              <div className="space-y-2 p-3">
                <div className="h-4 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent-bright)]">
          <Heart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Phim yêu thích</h1>
          <p className="text-sm text-zinc-500">Danh sách bạn đã lưu</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-10 text-center">
          <p className="text-zinc-400">Cần đăng nhập để xem danh sách yêu thích.</p>
          <p className="mt-2 text-sm text-red-300/90">{error}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-black"
          >
            Đăng nhập
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[var(--surface)]/50 px-8 py-16 text-center">
          <p className="text-zinc-400">Chưa có phim yêu thích.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent-bright)] hover:underline"
          >
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <MovieCard key={item.id} movie={item.movie} />
          ))}
        </div>
      )}
    </main>
  );
}
