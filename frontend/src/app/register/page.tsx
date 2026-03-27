'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User } from 'lucide-react';
import { authApi } from '@/lib/api';
import { notifyAuthChanged } from '@/lib/auth-events';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({ email, password, name: name || undefined });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      notifyAuthChanged();
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
    <div className="relative flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl shadow-black/50 md:min-h-[620px] md:flex-row-reverse">
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-gradient-to-bl from-[var(--tag-green)]/14 via-[#12151a] to-[var(--background)] p-8 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_80%_0%,rgba(34,197,94,0.2),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(220,38,38,0.1),transparent_50%)]" />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--tag-green)]">
            Bắt đầu miễn phí
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Tạo tài khoản
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
            Một lần đăng ký — lưu phim yêu thích, tiếp tục xem từ giây đã dừng.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center border-t border-[var(--border-subtle)] bg-[var(--surface)] p-8 md:border-t-0 md:border-r md:border-[var(--border-subtle)] md:p-12">
        <h2 className="text-xl font-bold text-white">Đăng ký</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-[var(--tag-green)] hover:underline">
            Đăng nhập
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1016] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Tên hiển thị (tuỳ chọn)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1016] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1016] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600"
                required
                minLength={6}
              />
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-red-500/35 bg-red-950/35 px-3 py-2.5 text-sm text-red-100">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#b91c1c] py-3 text-sm font-bold text-white shadow-lg shadow-red-950/40 transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý…' : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
