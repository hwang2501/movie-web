'use client';

import Link from 'next/link';
import type { Movie } from '@/lib/api';

type Props = {
  movie: Movie;
  className?: string;
};

/** Thẻ poster dọc: badge Vietsub / HD + dòng tập */
export function MovieCard({ movie, className = '' }: Props) {
  const eps = movie._count?.episodes ?? 0;
  const epLabel =
    eps > 1
      ? `Trọn bộ ${eps} tập`
      : eps === 1
        ? 'Phim lẻ'
        : 'Sắp chiếu';

  return (
    <Link
      href={`/movie/${movie.slug}`}
      className={`group block w-full ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] shadow-lg transition duration-200 group-hover:border-[var(--tag-green)]/50 group-hover:shadow-[var(--tag-green)]/5">
        {movie.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.thumbnail}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 text-4xl text-zinc-600">
            ▶
          </div>
        )}

        <div className="pointer-events-none absolute left-0 right-0 top-0 flex flex-wrap gap-1 p-1.5">
          <span className="rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--tag-green)]">
            Vietsub
          </span>
          <span className="rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-[var(--tag-gold)]">
            HD
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2 pt-10">
          <p className="line-clamp-2 text-center text-[13px] font-semibold leading-snug text-white group-hover:text-[var(--tag-green)]">
            {movie.title}
          </p>
          <p className="mt-0.5 text-center text-[10px] text-zinc-400">{epLabel}</p>
          {movie.year != null && (
            <p className="text-center text-[10px] text-zinc-500">{movie.year}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
