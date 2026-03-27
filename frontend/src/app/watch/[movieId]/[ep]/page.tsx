'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ListVideo, MessageCircle } from 'lucide-react';
import {
  moviesApi,
  commentsApi,
  episodesApi,
  watchHistoryApi,
  type MovieDetail,
  type Comment,
} from '@/lib/api';
import { HlsPlayer } from '@/components/HlsPlayer';

export default function WatchPage() {
  const params = useParams();
  const movieId = params?.movieId as string;
  const epNum = Number(params?.ep);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    Promise.all([moviesApi.byId(movieId), commentsApi.byMovie(movieId)])
      .then(([m, c]) => {
        setMovie(m);
        setComments(c);
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  const ep = movie?.episodes.find((e) => e.number === epNum);

  useEffect(() => {
    if (!ep) return;
    episodesApi
      .streamUrl(ep.id)
      .then((res) => setStreamUrl(res.streamUrl))
      .catch(() => setStreamUrl(ep.hlsPath));

    watchHistoryApi.upsert(ep.id, 0).catch(() => undefined);
  }, [ep]);

  if (loading || !movie) {
    return (
      <main className="mx-auto max-w-6xl animate-pulse px-4 py-10">
        <div className="aspect-video w-full rounded-2xl bg-zinc-900" />
      </main>
    );
  }

  const playUrl = streamUrl || ep?.hlsPath || '';

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <Link
        href={`/movie/${movie.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {movie.title}
      </Link>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <div className="aspect-video">
              {ep && playUrl ? (
                <HlsPlayer src={playUrl} poster={movie.thumbnail ?? undefined} />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500">
                  Không tìm thấy tập hoặc chưa có luồng phát.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-white/5 px-3 py-1 text-sm text-zinc-300">
              Đang xem: Tập {epNum}
            </span>
            {movie.year != null && (
              <span className="text-sm text-zinc-500">{movie.year}</span>
            )}
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-72 xl:w-80">
          <div className="rounded-2xl border border-white/10 bg-[var(--surface)]/80 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-white">
              <ListVideo className="h-5 w-5 text-[var(--accent-bright)]" />
              <h2 className="font-bold">Các tập</h2>
            </div>
            <div className="mt-3 max-h-[min(420px,50vh)] space-y-1 overflow-y-auto pr-1">
              {movie.episodes.map((e) => {
                const active = e.number === epNum;
                return (
                  <Link
                    key={e.id}
                    href={`/watch/${movie.id}/${e.number}`}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-[var(--accent-muted)] text-[var(--accent-bright)] ring-1 ring-[var(--accent)]/30'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>Tập {e.number}</span>
                    {e.title && (
                      <span className="max-w-[120px] truncate text-xs opacity-70">
                        {e.title}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-12 rounded-2xl border border-white/10 bg-[var(--surface)]/60 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[var(--accent-bright)]" />
          <h3 className="text-lg font-bold text-white">
            Bình luận ({comments.length})
          </h3>
        </div>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có bình luận.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 rounded-xl border border-white/5 bg-black/30 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-rose-800 text-sm font-bold text-black">
                  {(c.user.name ?? c.user.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-200">
                    {c.user.name ?? c.user.email}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {c.content}
                  </p>
                  <p className="mt-2 text-xs text-zinc-600">
                    {new Date(c.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
