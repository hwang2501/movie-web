'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { moviesApi, type Movie } from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';
import { MovieRow } from '@/components/MovieRow';
import { PremiereCard } from '@/components/PremiereCard';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function HomeClient() {
  const searchParams = useSearchParams();
  const genre = searchParams.get('genre') ?? '';
  const country = searchParams.get('country') ?? '';
  const year = searchParams.get('year') ?? '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounced(searchInput, 400);
  const premiereRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    moviesApi
      .list({
        q: debouncedSearch.trim() || undefined,
        genre: genre || undefined,
        country: country || undefined,
        year: year || undefined,
      })
      .then(setMovies)
      .catch(() =>
        setError(
          'Không tải được danh sách phim. Kiểm tra backend và file .env.local.',
        ),
      )
      .finally(() => setLoading(false));
  }, [debouncedSearch, genre, country, year]);

  useEffect(() => {
    load();
  }, [load]);

  const isSearchMode = debouncedSearch.trim().length > 0;
  const isFilterMode = Boolean(
    !isSearchMode && (genre || country || year),
  );

  const filterDescription = useMemo(() => {
    const parts: string[] = [];
    if (genre) parts.push(`Thể loại: ${genre}`);
    if (country) parts.push(`Quốc gia: ${country}`);
    if (year) parts.push(`Năm: ${year}`);
    return parts.join(' · ');
  }, [genre, country, year]);

  const debut = useMemo(() => movies.slice(0, 10), [movies]);
  const seriesLike = useMemo(
    () => movies.filter((m) => (m._count?.episodes ?? 0) > 1).slice(0, 18),
    [movies],
  );
  const singlesLike = useMemo(
    () => movies.filter((m) => (m._count?.episodes ?? 0) <= 1).slice(0, 18),
    [movies],
  );

  function scrollPremiere(dir: 'left' | 'right') {
    const el = premiereRef.current;
    if (!el) return;
    const d = dir === 'left' ? -360 : 360;
    el.scrollBy({ left: d, behavior: 'smooth' });
  }

  const showListOnly = isSearchMode || isFilterMode;

  return (
    <div className="pb-10">
      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface)]/60">
        <div className="mx-auto max-w-7xl px-4 py-4 md:py-5">
          <div className="relative mx-auto max-w-3xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              id="home-search-input"
              type="search"
              placeholder="Tìm phim theo tên... (Vietsub HD)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[#0d1016] py-3.5 pl-12 pr-4 text-base text-white placeholder:text-zinc-500 md:py-4"
              autoComplete="off"
            />
          </div>
          {(genre || country || year) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-zinc-500">Bộ lọc URL:</span>
              {genre && (
                <Link
                  href={(() => {
                    const sp = new URLSearchParams(searchParams.toString());
                    sp.delete('genre');
                    const qs = sp.toString();
                    return qs ? `/?${qs}` : '/';
                  })()}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-black/30 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-[var(--tag-green)]/40 hover:text-[var(--tag-green)]"
                >
                  {genre}
                  <X className="h-3 w-3" />
                </Link>
              )}
              {country && (
                <Link
                  href={(() => {
                    const sp = new URLSearchParams(searchParams.toString());
                    sp.delete('country');
                    const qs = sp.toString();
                    return qs ? `/?${qs}` : '/';
                  })()}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-black/30 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-[var(--tag-green)]/40 hover:text-[var(--tag-green)]"
                >
                  {country}
                  <X className="h-3 w-3" />
                </Link>
              )}
              {year && (
                <Link
                  href={(() => {
                    const sp = new URLSearchParams(searchParams.toString());
                    sp.delete('year');
                    const qs = sp.toString();
                    return qs ? `/?${qs}` : '/';
                  })()}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-black/30 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-[var(--tag-green)]/40 hover:text-[var(--tag-green)]"
                >
                  {year}
                  <X className="h-3 w-3" />
                </Link>
              )}
              <Link
                href="/"
                className="text-[11px] font-medium text-[var(--tag-green)] hover:underline"
              >
                Xóa hết
              </Link>
            </div>
          )}
        </div>
      </section>

      {loading && !movies.length ? (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 w-96 shrink-0 animate-pulse rounded-xl bg-zinc-800"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-red-300">
          {error}
        </div>
      ) : showListOnly ? (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-lg font-bold uppercase tracking-wide text-white">
            {isSearchMode ? (
              <>
                Kết quả tìm kiếm
                {!loading && (
                  <span className="ml-2 font-normal normal-case text-zinc-500">
                    ({movies.length}) &quot;{debouncedSearch.trim()}&quot;
                  </span>
                )}
              </>
            ) : (
              <>
                Phim theo bộ lọc
                {!loading && (
                  <span className="ml-2 font-normal normal-case text-zinc-500">
                    ({movies.length}) {filterDescription && `· ${filterDescription}`}
                  </span>
                )}
              </>
            )}
          </h1>
          {!loading && movies.length === 0 && (
            <p className="mt-4 text-zinc-500">Không có phim phù hợp.</p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-7xl px-4">
          <section id="phim-de-cu" className="py-8">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-[15px] font-bold uppercase tracking-wide text-white md:text-base">
                Phim mới đề cử
              </h1>
              <div className="hidden gap-1 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollPremiere('left')}
                  className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 text-zinc-400 hover:text-white"
                  aria-label="Trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollPremiere('right')}
                  className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 text-zinc-400 hover:text-white"
                  aria-label="Sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              ref={premiereRef}
              className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:md:h-1"
            >
              {debut.map((m) => (
                <PremiereCard key={m.id} movie={m} />
              ))}
            </div>
          </section>

          {movies.length === 0 ? (
            <p className="py-12 text-center text-zinc-500">Chưa có phim.</p>
          ) : (
            <>
              <MovieRow
                id="phim-bo"
                title="Phim bộ mới cập nhật"
                subtitle="Nhiều tập — bấm xem danh sách tập"
                movies={seriesLike}
              />
              <MovieRow
                id="phim-le"
                title="Phim lẻ mới cập nhật"
                subtitle="Một phần hoặc một tập"
                movies={singlesLike}
              />

              <section className="mb-10">
                <h2 className="mb-4 text-[15px] font-bold uppercase tracking-wide text-white">
                  Tất cả phim
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                  {movies.map((m) => (
                    <MovieCard key={`all-${m.id}`} movie={m} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
