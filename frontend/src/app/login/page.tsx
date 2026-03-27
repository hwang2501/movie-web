'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Lock, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { notifyAuthChanged } from '@/lib/auth-events';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (r: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            opts: {
              theme?: string;
              size?: string;
              width?: string | number;
              text?: string;
              locale?: string;
              shape?: string;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';

/** Tránh open redirect; chỉ cho path nội bộ. */
function safeNextPath(): string {
  if (typeof window === 'undefined') return '/';
  const raw = new URLSearchParams(window.location.search).get('next');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reason = new URLSearchParams(window.location.search).get('reason');
    if (reason === 'session') {
      setError(
        'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để vào trang tài khoản.',
      );
    }
  }, []);

  const onGoogleCredential = useCallback(
    async (credential: string) => {
      setError('');
      setLoading(true);
      try {
        const res = await authApi.google(credential);
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        notifyAuthChanged();
        router.push(safeNextPath());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đăng nhập Google thất bại');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (
      !gsiLoaded ||
      !GOOGLE_CLIENT_ID ||
      !googleBtnRef.current ||
      typeof window === 'undefined' ||
      !window.google?.accounts?.id
    ) {
      return;
    }
    const mount = googleBtnRef.current;
    mount.innerHTML = '';
    const w = Math.min(400, mount.offsetWidth || 400);
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res) => onGoogleCredential(res.credential),
    });
    window.google.accounts.id.renderButton(mount, {
      theme: 'filled_black',
      size: 'large',
      width: w,
      text: 'continue_with',
      locale: 'vi',
      shape: 'rectangular',
    });
  }, [gsiLoaded, onGoogleCredential]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      notifyAuthChanged();
      router.push(safeNextPath());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div className="relative flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl shadow-black/50 md:min-h-[560px] md:flex-row">
        {/* Hero — ưu tiên xanh brand, đỏ chỉ nhấn nhẹ */}
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-[var(--tag-green)]/14 via-[#12151a] to-[var(--background)] p-8 md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_20%_0%,rgba(34,197,94,0.22),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(220,38,38,0.12),transparent_50%)]" />
          <div className="relative">
            <p className="flex items-baseline gap-0 text-sm font-black uppercase tracking-[0.2em]">
              <span className="text-[var(--tag-green)]">Phim</span>
              <span className="text-white">Web</span>
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Chào mừng trở lại
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
              Đăng nhập để lưu yêu thích, lịch sử xem và đồng bộ trên các thiết bị.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-1 flex-col justify-center border-t border-[var(--border-subtle)] bg-[var(--surface)] p-8 md:border-t-0 md:border-l md:border-[var(--border-subtle)] md:p-12">
          <h2 className="text-xl font-bold text-white">Đăng nhập</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-semibold text-[var(--tag-green)] hover:text-[var(--tag-green)]/90 hover:underline"
            >
              Đăng ký
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
                Mật khẩu
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
              {loading ? 'Đang xử lý…' : 'Đăng nhập'}
            </button>
          </form>

          {GOOGLE_CLIENT_ID ? (
            <>
              <Script
                src="https://accounts.google.com/gsi/client"
                strategy="lazyOnload"
                onLoad={() => setGsiLoaded(true)}
              />
              <div className="relative my-7">
                <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
                <p className="relative mx-auto w-fit bg-[var(--surface)] px-4 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Hoặc tiếp tục với
                </p>
              </div>
              <div
                ref={googleBtnRef}
                className="flex min-h-[48px] w-full max-w-[400px] justify-center [&>div]:w-full [&_iframe]:!w-full"
              />
            </>
          ) : (
            <div className="mt-7 space-y-3">
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
                <p className="relative mx-auto w-fit bg-[var(--surface)] px-4 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Đăng nhập Google
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-white/15 bg-[#0d1016]/80 px-4 py-4 text-center">
                <p className="text-sm text-zinc-400">
                  Đăng nhập Google chưa bật. Cấu hình{' '}
                  <code className="rounded bg-black/40 px-1 font-mono text-[11px] text-zinc-500">
                    NEXT_PUBLIC_GOOGLE_CLIENT_ID
                  </code>{' '}
                  và{' '}
                  <code className="rounded bg-black/40 px-1 font-mono text-[11px] text-zinc-500">
                    GOOGLE_CLIENT_ID
                  </code>{' '}
                  theo README repo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
