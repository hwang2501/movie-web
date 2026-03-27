'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import type { Movie } from '@/lib/api';

type Props = {
  movie: Movie;
};

/** Thẻ đề cử ngang — hàng “Phim mới đề cử” */
export function PremiereCard({ movie }: Props) {
  const eps = movie._count?.episodes ?? 0;
  const epLine =
    eps > 1 ? `Trọn bộ ${eps} tập` : eps === 1 ? 'Phim lẻ' : 'Đang cập nhật';
  const href =
    eps > 0 ? `/watch/${movie.id}/1` : `/movie/${movie.slug}`;

  return (
    <Link
      href={href}
      className="group flex w-[min(92vw,380px)] shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xl transition hover:border-[var(--tag-green)]/40 md:w-[400px]"
    >
      <div className="relative h-[200px] w-[120px] shrink-0 md:h-[220px] md:w-[140px]">
        {movie.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.thumbnail}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-800 text-3xl text-zinc-600">
            ▶
          </div>
        )}
        <div className="absolute left-1 top-1 flex gap-1">
          <span className="rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-[var(--tag-green)]">
            Vietsub
          </span>
          <span className="rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-[var(--tag-gold)]">
            HD
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
        <p className="line-clamp-2 text-base font-bold leading-snug text-white group-hover:text-[var(--tag-green)] md:text-lg">
          {movie.title}
        </p>
        <p className="text-xs text-zinc-500">{epLine}</p>
        {movie.description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
            {movie.description}
          </p>
        )}
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white transition group-hover:bg-[var(--accent-hover)]">
          <Play className="h-3.5 w-3.5 fill-current" />
          Xem phim
        </span>
      </div>
    </Link>
  );
}
