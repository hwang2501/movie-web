'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Play } from 'lucide-react';
import { favoritesApi, moviesApi, type MovieDetail } from '@/lib/api';

export default function MovieDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [favMessage, setFavMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    moviesApi
      .bySlug(slug)
      .then(setMovie)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl animate-pulse px-4 py-10">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="mt-8 h-64 rounded-2xl bg-zinc-900" />
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-zinc-500">
        Không tìm thấy phim.
      </main>
    );
  }

  async function addFavorite() {
    try {
      await favoritesApi.add(movie!.id);
      setFavMessage('Đã thêm vào yêu thích');
    } catch (err) {
      setFavMessage(err instanceof Error ? err.message : 'Cần đăng nhập để lưu yêu thích');
    }
  }

  const hasEps = movie.episodes.length > 0;
  const watchFirst = hasEps
    ? `/watch/${movie.id}/${movie.episodes[0].number}`
    : null;

  return (
    <main className="pb-16">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {movie.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.thumbnail}
              alt=""
              className="h-full min-h-[420px] w-full object-cover opacity-30 blur-md"
            />
          ) : (
            <div className="min-h-[420px] bg-gradient-to-b from-zinc-800 to-[var(--background)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/92 to-[var(--background)]/70" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 md:pt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>

          <div className="mt-8 flex flex-col gap-10 md:flex-row md:items-end">
            <div className="w-full max-w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-sm">
              <div className="aspect-[2/3] bg-zinc-900">
                {movie.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={movie.thumbnail}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-zinc-700">
                    ▶
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 pb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                {movie.year != null && (
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-zinc-300">
                    {movie.year}
                  </span>
                )}
                {movie._count?.comments != null && (
                  <span>{movie._count.comments} bình luận</span>
                )}
                <span>{movie.episodes.length} tập</span>
              </div>
              {movie.description && (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300">
                  {movie.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {watchFirst ? (
                  <Link
                    href={watchFirst}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-black shadow-lg shadow-[var(--accent)]/25 transition hover:brightness-110"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Phát từ tập 1
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-zinc-700 px-6 py-3 text-sm font-bold text-zinc-400">
                    <Play className="h-5 w-5 fill-current opacity-50" />
                    Chưa có tập
                  </span>
                )}
                <button
                  type="button"
                  onClick={addFavorite}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  <Heart className="h-5 w-5" />
                  Yêu thích
                </button>
              </div>
              {favMessage && (
                <p className="mt-3 text-sm text-zinc-500">{favMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-xl font-bold text-white md:text-2xl">Danh sách tập</h2>
        <p className="mt-1 text-sm text-zinc-500">Chọn tập để xem</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {movie.episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/${movie.id}/${ep.number}`}
              className="min-w-[3.5rem] rounded-xl border border-white/10 bg-[var(--surface)] px-4 py-2.5 text-center text-sm font-semibold text-zinc-200 transition hover:border-[var(--accent)]/50 hover:bg-[var(--accent-muted)] hover:text-[var(--accent-bright)]"
            >
              {ep.number}
            </Link>
          ))}
        </div>
        {movie.episodes.length === 0 && (
          <p className="mt-4 text-zinc-500">Chưa có tập phim.</p>
        )}
      </section>
    </main>
  );
}
