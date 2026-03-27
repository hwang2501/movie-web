'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tags, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { genresApi, type Genre } from '@/lib/api';

export default function AdminGenresPage() {
  const [rows, setRows] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    genresApi
      .list()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải thể loại'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await genresApi.create({ name: name.trim(), slug: slug.trim().toLowerCase() });
      setName('');
      setSlug('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm('Xóa thể loại này? Liên kết phim sẽ được gỡ.')) return;
    try {
      await genresApi.remove(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được');
    }
  }

  function autoSlugFromName(n: string) {
    return n
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Thể loại
          </h1>
          <p className="mt-1 text-sm text-zinc-500">CRUD — slug dùng cho URL lọc</p>
        </div>
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

      <form
        onSubmit={handleCreate}
        className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-6 md:grid-cols-3"
      >
        <div className="md:col-span-1">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tên hiển thị</label>
          <input
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (!slug || slug === autoSlugFromName(name)) {
                setSlug(autoSlugFromName(v));
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600"
            placeholder="Ví dụ: Hành động"
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600"
            placeholder="hanh-dong"
            required
          />
        </div>
        <div className="flex items-end md:col-span-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50 md:w-auto md:px-8"
          >
            <Plus className="h-4 w-4" />
            {saving ? 'Đang lưu…' : 'Thêm thể loại'}
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] shadow-xl shadow-black/30">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 md:px-6">
          <Tags className="h-5 w-5 text-[var(--accent-bright)]" />
          <span className="font-semibold text-white">Danh sách</span>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-2 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-zinc-800/80" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-4 font-medium md:px-6">Tên</th>
                  <th className="px-4 py-4 font-medium md:px-6">Slug</th>
                  <th className="px-4 py-4 font-medium md:px-6" />
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-medium text-white md:px-6">
                      {g.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500 md:px-6">
                      {g.slug}
                    </td>
                    <td className="px-4 py-3 text-right md:px-6">
                      <button
                        type="button"
                        onClick={() => handleRemove(g.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
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
