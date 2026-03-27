'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History as HistoryIcon, Play } from 'lucide-react';
import { watchHistoryApi, type WatchHistoryItem } from '@/lib/api';

export default function HistoryPage() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    watchHistoryApi
      .list()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Tải lịch sử thất bại'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 h-10 w-40 animate-pulse rounded-lg bg-zinc-800" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-900/80" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-[var(--accent-bright)] ring-1 ring-white/10">
          <HistoryIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Lịch sử xem</h1>
          <p className="text-sm text-zinc-500">Tiếp tục từ lần trước</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-10 text-center">
          <p className="text-zinc-400">Cần đăng nhập để xem lịch sử.</p>
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
          <p className="text-zinc-400">Chưa có lịch sử xem.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent-bright)] hover:underline"
          >
            Chọn một phim
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/watch/${item.episode.movie.id}/${item.episode.number}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-elevated)]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent-bright)] transition group-hover:bg-[var(--accent)] group-hover:text-black">
                  <Play className="h-5 w-5 fill-current" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white group-hover:text-[var(--accent-bright)]">
                    {item.episode.movie.title}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Tập {item.episode.number}
                    {item.progress > 0 && (
                      <span className="text-zinc-600">
                        {' '}
                        · Đã xem {Math.floor(item.progress / 60)} phút
                      </span>
                    )}
                  </p>
                </div>
                <span className="hidden text-xs text-zinc-600 sm:block">
                  {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
