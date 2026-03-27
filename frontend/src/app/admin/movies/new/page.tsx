'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { genresApi, moviesApi, type Genre } from '@/lib/api';
import {
  BROWSE_COUNTRIES,
  COUNTRY_SELECT_CUSTOM,
  countryFromPresetAndCustom,
} from '@/lib/browse-countries';

export default function AdminMovieNewPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [year, setYear] = useState('');
  const [countryPreset, setCountryPreset] = useState('');
  const [countryCustom, setCountryCustom] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    genresApi.list().then(setGenres).catch(() => setGenres([]));
  }, []);

  function toggleGenre(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function slugify(s: string) {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await moviesApi.create({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        thumbnail: thumbnail.trim() || null,
        year: year ? parseInt(year, 10) : null,
        country: countryFromPresetAndCustom(countryPreset, countryCustom),
        genreIds: Array.from(selected),
      });
      router.push(`/admin/movies/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
      <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/movies"
          className="text-sm font-medium text-zinc-400 hover:text-white"
        >
          ← Danh sách phim
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white md:text-3xl">Thêm phim mới</h1>
      <p className="mt-1 text-sm text-zinc-500">Điền metadata và chọn thể loại</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full space-y-5 rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-lg shadow-black/10 md:p-8"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tiêu đề</label>
          <input
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              if (!slug || slug === slugify(title)) setSlug(slugify(v));
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Slug URL</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Poster URL</label>
            <input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Năm</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
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
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
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
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white"
            />
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-400">Thể loại</p>
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
            {genres.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-300 hover:border-[var(--tag-green)]/40"
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

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50 md:w-auto md:px-10"
        >
          {saving ? 'Đang lưu…' : 'Tạo phim'}
        </button>
      </form>
      </div>
    </div>
  );
}
