'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExternalLink, Film, Pencil, Plus, RefreshCw } from 'lucide-react';
import { moviesApi, type Movie } from '@/lib/api';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    moviesApi
      .list()
      .then(setMovies)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Quản lý phim
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Thêm / sửa / tập phim — form giống giao diện chính
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/movies/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Thêm phim
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="mb-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 lg:gap-5">
        {[
          { label: 'Tổng phim', value: loading ? '—' : String(movies.length) },
          { label: 'Có poster', value: loading ? '—' : String(movies.filter((m) => m.thumbnail).length) },
          {
            label: 'Tập (ước lượng)',
            value: loading
              ? '—'
              : String(movies.reduce((s, m) => s + (m._count?.episodes ?? 0), 0)),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-[var(--surface)] p-5 shadow-lg shadow-black/20"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-6 lg:px-8">
          <Film className="h-5 w-5 shrink-0 text-[var(--accent-bright)]" />
          <span className="text-base font-semibold text-white">Bảng phim</span>
          {!loading && (
            <span className="ml-auto text-sm text-zinc-500">
              {movies.length} phim
            </span>
          )}
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3 p-6 lg:p-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[100px] rounded-xl bg-zinc-800/80" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[72rem] table-fixed text-left lg:min-w-0">
              <colgroup>
                <col className="w-[168px]" />
                <col />
                <col className="w-[4.5rem]" />
                <col className="w-[9rem] xl:w-[10rem]" />
                <col className="w-[11rem] xl:w-[15rem]" />
                <col className="w-[4.5rem]" />
                <col className="w-[220px] xl:w-[240px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-4 py-3.5 pl-5 sm:px-5 lg:pl-8">Poster</th>
                  <th className="px-3 py-3.5">Phim</th>
                  <th className="px-3 py-3.5">Năm</th>
                  <th className="px-3 py-3.5">Quốc gia</th>
                  <th className="px-3 py-3.5">Thể loại</th>
                  <th className="px-3 py-3.5 text-center">Tập</th>
                  <th className="px-4 py-3.5 pr-5 text-right sm:px-5 lg:pr-8">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/[0.06] align-middle transition hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 pl-5 sm:px-5 lg:pl-8">
                      <div className="aspect-video w-[128px] max-w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-800/90 shadow-inner sm:w-[140px]">
                        {m.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-video w-full items-center justify-center bg-zinc-800 text-sm text-zinc-500">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[15px] font-semibold leading-snug text-white">
                        {m.title}
                      </p>
                      <p
                        className="mt-1 break-all font-mono text-xs leading-relaxed text-zinc-400"
                        title={m.slug}
                      >
                        /{m.slug}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-sm tabular-nums text-zinc-300">
                      {m.year ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-sm text-zinc-300">
                      {m.country ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-sm leading-snug text-zinc-300">
                      {m.genres?.length
                        ? m.genres.map((x) => x.genre.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-[var(--tag-green)]/15 px-2.5 py-1 text-sm font-bold tabular-nums text-[var(--tag-green)]">
                        {m._count?.episodes ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-5 text-right sm:px-5 lg:pr-8">
                      <div className="flex flex-col items-stretch gap-2 sm:inline-flex sm:flex-row sm:items-center sm:justify-end">
                        <Link
                          href={`/admin/movies/${m.id}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--tag-green)]/45 bg-[var(--tag-green)]/12 px-3.5 py-2 text-sm font-semibold text-[var(--tag-green)] transition hover:bg-[var(--tag-green)]/22"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          Sửa phim
                        </Link>
                        <Link
                          href={`/movie/${m.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-3.5 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4 shrink-0" />
                          Trang xem
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
