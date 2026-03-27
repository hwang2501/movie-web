'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  episodesApi,
  genresApi,
  moviesApi,
  type Genre,
  type MovieDetail,
} from '@/lib/api';
import {
  BROWSE_COUNTRIES,
  COUNTRY_SELECT_CUSTOM,
  countryFromPresetAndCustom,
  splitCountryForForm,
} from '@/lib/browse-countries';

export default function AdminMovieEditPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [year, setYear] = useState('');
  const [countryPreset, setCountryPreset] = useState('');
  const [countryCustom, setCountryCustom] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [epNumber, setEpNumber] = useState('1');
  const [epTitle, setEpTitle] = useState('');
  const [epPath, setEpPath] = useState('');
  const [epDuration, setEpDuration] = useState('3600');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([moviesApi.byId(id), genresApi.list()])
      .then(([m, g]) => {
        setMovie(m);
        setGenres(g);
        setTitle(m.title);
        setSlug(m.slug);
        setDescription(m.description ?? '');
        setThumbnail(m.thumbnail ?? '');
        setYear(m.year != null ? String(m.year) : '');
        const c = splitCountryForForm(m.country);
        setCountryPreset(c.preset);
        setCountryCustom(c.custom);
        setSelected(new Set(m.genres?.map((x) => x.genre.id) ?? []));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Không tải được phim'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleGenre(gid: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(gid)) n.delete(gid);
      else n.add(gid);
      return n;
    });
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await moviesApi.update(id, {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        thumbnail: thumbnail.trim() || null,
        year: year ? parseInt(year, 10) : null,
        country: countryFromPresetAndCustom(countryPreset, countryCustom),
        genreIds: Array.from(selected),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được');
    } finally {
      setSaving(false);
    }
  }

  async function addEpisode(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await episodesApi.create({
        movieId: id,
        number: parseInt(epNumber, 10),
        title: epTitle.trim() || undefined,
        hlsPath: epPath.trim(),
        duration: epDuration ? parseInt(epDuration, 10) : undefined,
      });
      setEpTitle('');
      setEpPath('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thêm tập được');
    } finally {
      setSaving(false);
    }
  }

  async function removeEpisode(epId: string) {
    if (!window.confirm('Xóa tập này?')) return;
    try {
      await episodesApi.remove(epId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được tập');
    }
  }

  async function removeMovie() {
    if (!id) return;
    if (!window.confirm('Xóa phim và toàn bộ tập?')) return;
    try {
      await moviesApi.remove(id);
      window.location.href = '/admin/movies';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được phim');
    }
  }

  if (loading && !movie) {
    return (
      <div className="px-6 py-10 text-zinc-500">Đang tải phim…</div>
    );
  }

  if (!movie) {
    return (
      <div className="px-6 py-10 text-red-300">
        {error ?? 'Không tìm thấy phim'}
      </div>
    );
  }

  const cardClass =
    'rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-lg shadow-black/10 md:p-8';

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/movies"
            className="text-sm font-medium text-zinc-400 hover:text-white"
          >
            ← Danh sách phim
          </Link>
          <button
            type="button"
            onClick={removeMovie}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            Xóa phim
          </button>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tag-green)]">
          Sửa phim
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{movie.title}</h1>
        <p className="mt-1 font-mono text-xs text-zinc-400">{movie.id}</p>

        {error && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <form onSubmit={saveMeta} className="mt-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className={`${cardClass} space-y-5 lg:col-span-7`}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Thông tin phim
              </h2>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tiêu đề</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-relaxed text-white"
                />
              </div>
            </div>

            <div className={`${cardClass} space-y-5 lg:col-span-5`}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Poster &amp; phát hành
              </h2>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Poster URL</label>
                <input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white"
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {thumbnail.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail.trim()}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-zinc-900/80 text-sm text-zinc-500">
                    Xem trước poster
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Năm</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Quốc gia (cùng danh sách với lọc trang chủ)
                </label>
                <select
                  value={countryPreset}
                  onChange={(e) => setCountryPreset(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                >
                  <option value="">— Chưa chọn —</option>
                  {BROWSE_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value={COUNTRY_SELECT_CUSTOM}>Khác (gõ tay)…</option>
                </select>
                {countryPreset === COUNTRY_SELECT_CUSTOM && (
                  <input
                    value={countryCustom}
                    onChange={(e) => setCountryCustom(e.target.value)}
                    placeholder="Tên quốc gia tùy chỉnh"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                  />
                )}
              </div>
            </div>

            <div className={`${cardClass} lg:col-span-12`}>
              <p className="mb-3 text-xs font-medium text-zinc-400">Thể loại</p>
              <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
                {genres.map((g) => (
                  <label
                    key={g.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300 hover:border-[var(--tag-green)]/40"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(g.id)}
                      onChange={() => toggleGenre(g.id)}
                      className="rounded border-white/20 bg-black"
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="lg:col-span-12">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
              >
                {saving ? 'Đang lưu…' : 'Lưu phim'}
              </button>
            </div>
          </div>
        </form>

        <section className={`${cardClass} mt-10 space-y-4`}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
          Tập phim
        </h2>
        <ul className="mt-4 space-y-2">
          {movie.episodes.map((ep) => (
            <li
              key={ep.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm"
            >
              <span className="font-mono text-zinc-400">
                #{ep.number}{ep.title ? ` · ${ep.title}` : ''}
              </span>
              <span className="max-w-md truncate font-mono text-xs text-zinc-500">
                {ep.hlsPath}
              </span>
              <button
                type="button"
                onClick={() => removeEpisode(ep.id)}
                className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-200 hover:bg-red-950/30"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addEpisode} className="mt-6 grid gap-3 border-t border-white/10 pt-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Số tập</label>
            <input
              type="number"
              value={epNumber}
              onChange={(e) => setEpNumber(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Tiêu đề tập (tuỳ chọn)</label>
            <input
              value={epTitle}
              onChange={(e) => setEpTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] text-zinc-500">Đường dẫn HLS</label>
            <input
              value={epPath}
              onChange={(e) => setEpPath(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white"
              placeholder="/videos/slug/ep1/master.m3u8"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Thời lượng (giây)</label>
            <input
              type="number"
              value={epDuration}
              onChange={(e) => setEpDuration(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-white/10 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              Thêm tập
            </button>
          </div>
        </form>
        </section>

        <p className="mt-8 text-center text-sm">
          <Link
            href={`/movie/${movie.slug}`}
            className="text-[var(--tag-green)] hover:underline"
          >
            Xem trang công khai →
          </Link>
        </p>
      </div>
    </div>
  );
}
