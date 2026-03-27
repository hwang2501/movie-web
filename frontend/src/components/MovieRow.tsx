'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Movie } from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';

type Props = {
  /** Tiêu đề dạng chữ in (ví dụ PHIM BỘ MỚI CẬP NHẬT) */
  title: string;
  subtitle?: string;
  movies: Movie[];
  id?: string;
};

export function MovieRow({ title, subtitle, movies, id }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  function scroll(dir: 'left' | 'right') {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.min(el.clientWidth * 0.8, 360) * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <section id={id} className="mb-8 md:mb-10">
      <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
        <div>
          <h2 className="text-[15px] font-bold uppercase tracking-wide text-white md:text-base">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className="hidden shrink-0 gap-0.5 sm:flex">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 text-zinc-400 transition hover:bg-[var(--surface-elevated)] hover:text-white"
            aria-label="Trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 text-zinc-400 transition hover:bg-[var(--surface-elevated)] hover:text-white"
            aria-label="Sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] sm:gap-3.5 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700"
      >
        {movies.map((m) => (
          <div
            key={m.id}
            className="w-[112px] shrink-0 snap-start sm:w-[128px] md:w-[140px]"
          >
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
