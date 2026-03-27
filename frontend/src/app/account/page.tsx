'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { authApi } from '@/lib/api';

function isLikelyNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const m = e.message;
  return /failed to fetch|networkerror|load failed|network request failed/i.test(
    m,
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [email, setEmail] = useState('');
  const [googleId, setGoogleId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(() => {
    if (typeof window === 'undefined') return;
    setLoadError(null);
    if (!localStorage.getItem('accessToken')) {
      router.replace('/login?next=%2Faccount');
      return;
    }
    setLoading(true);
    authApi
      .me()
      .then((u) => {
        setEmail(u.email);
        setName(u.name ?? '');
        setImageUrl(u.imageUrl ?? '');
        setPreview(u.imageUrl);
        setGoogleId(u.googleId);
      })
      .catch((e) => {
        if (isLikelyNetworkError(e)) {
          setLoadError(
            'Không kết nối được máy chủ API. Kiểm tra backend đang chạy và file frontend/.env.local có NEXT_PUBLIC_API_URL đúng cổng với PORT trong backend/.env.',
          );
          return;
        }
        router.replace('/login?next=%2Faccount&reason=session');
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const trimmedUrl = imageUrl.trim();
      await authApi.updateProfile({
        name: name.trim() || undefined,
        imageUrl: trimmedUrl.length ? trimmedUrl : null,
      });
      setPreview(trimmedUrl || null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-zinc-500">
        Đang tải…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 md:py-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 text-sm text-amber-100">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Về trang chủ
      </Link>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 md:p-8">
        <h1 className="text-xl font-bold text-white md:text-2xl">Tài khoản</h1>
        <p className="mt-1 text-sm text-zinc-500">{email}</p>
        {googleId && (
          <p className="mt-2 text-xs text-zinc-600">
            Tài khoản liên kết Google — ảnh Google sẽ cập nhật mỗi lần bạn đăng nhập bằng Google (trừ khi bạn đặt ảnh URL riêng bên dưới).
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4 border-b border-white/10 pb-8">
          <div className="relative">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="h-28 w-28 rounded-full border-2 border-[var(--border-subtle)] object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-zinc-600 bg-zinc-900/80 text-3xl text-zinc-600">
                <Camera className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Tên hiển thị
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d1016] px-4 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              URL ảnh đại diện (http/https)
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onBlur={() => {
                const t = imageUrl.trim();
                setPreview(t || null);
              }}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-[#0d1016] px-4 py-2.5 font-mono text-xs text-white placeholder:text-zinc-600"
            />
            <p className="mt-1 text-[11px] text-zinc-600">
              Để trống và lưu để xóa ảnh (hiện chữ viết tắt trên menu).
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/35 bg-red-950/35 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--tag-green)] to-[#16a34a] py-3 text-sm font-bold text-white shadow-lg shadow-green-950/30 transition hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
