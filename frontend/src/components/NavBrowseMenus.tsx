'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { genresApi, type Genre } from '@/lib/api';
import { BROWSE_COUNTRIES } from '@/lib/browse-countries';

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

function DropGenreWithBase({
  label,
  genres,
  activeSlug,
  base,
}: {
  label: string;
  genres: Genre[];
  activeSlug: string;
  base: URLSearchParams;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm text-zinc-400 transition hover:text-[var(--tag-green)]"
      >
        {label}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>
      <div className="pointer-events-none invisible absolute left-0 top-full z-[60] max-h-72 w-52 translate-y-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] py-1 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {genres.length === 0 ? (
          <span className="block px-3 py-2 text-xs text-zinc-500">Đang tải…</span>
        ) : (
          genres.map((g) => {
            const sp = new URLSearchParams(base.toString());
            sp.set('genre', g.slug);
            return (
              <Link
                key={g.id}
                href={`/?${sp.toString()}`}
                className={`block px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.04] hover:text-[var(--tag-green)] ${
                  activeSlug === g.slug
                    ? 'text-[var(--tag-green)]'
                    : 'text-zinc-400'
                }`}
              >
                {g.name}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function DropCountryWithBase({
  label,
  active,
  base,
}: {
  label: string;
  active: string;
  base: URLSearchParams;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm text-zinc-400 transition hover:text-[var(--tag-green)]"
      >
        {label}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>
      <div className="pointer-events-none invisible absolute left-0 top-full z-[60] max-h-72 w-48 translate-y-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] py-1 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {BROWSE_COUNTRIES.map((c) => {
          const sp = new URLSearchParams(base.toString());
          sp.set('country', c);
          return (
            <Link
              key={c}
              href={`/?${sp.toString()}`}
              className={`block px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.04] hover:text-[var(--tag-green)] ${
                active === c ? 'text-[var(--tag-green)]' : 'text-zinc-400'
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function DropYearWithBase({
  label,
  active,
  base,
}: {
  label: string;
  active: string;
  base: URLSearchParams;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm text-zinc-400 transition hover:text-[var(--tag-green)]"
      >
        {label}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>
      <div className="pointer-events-none invisible absolute left-0 top-full z-[60] max-h-72 w-36 translate-y-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] py-1 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {YEARS.map((y) => {
          const sp = new URLSearchParams(base.toString());
          sp.set('year', y);
          return (
            <Link
              key={y}
              href={`/?${sp.toString()}`}
              className={`block px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.04] hover:text-[var(--tag-green)] ${
                active === y ? 'text-[var(--tag-green)]' : 'text-zinc-400'
              }`}
            >
              {y}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function NavBrowseMenus() {
  const params = useSearchParams();
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    genresApi.list().then(setGenres).catch(() => setGenres([]));
  }, []);

  const genreActive = params.get('genre') ?? '';
  const countryActive = params.get('country') ?? '';
  const yearActive = params.get('year') ?? '';

  const base = new URLSearchParams(params.toString());

  return (
    <div className="hidden flex-wrap items-center gap-x-0.5 gap-y-1 md:flex">
      <Link
        href="/"
        className="rounded-md px-3 py-2.5 text-sm font-semibold text-white hover:text-[var(--tag-green)]"
      >
        Trang chủ
      </Link>
      <Link
        href="/#phim-le"
        className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-[var(--tag-green)]"
      >
        Phim lẻ
      </Link>
      <Link
        href="/#phim-bo"
        className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-[var(--tag-green)]"
      >
        Phim bộ
      </Link>
      <DropGenreWithBase
        label="Thể loại"
        genres={genres}
        activeSlug={genreActive}
        base={base}
      />
      <DropCountryWithBase
        label="Quốc gia"
        active={countryActive}
        base={base}
      />
      <DropYearWithBase label="Năm" active={yearActive} base={base} />
    </div>
  );
}
