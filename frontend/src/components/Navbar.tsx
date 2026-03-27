'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, History, LayoutDashboard } from 'lucide-react';
import { authApi } from '@/lib/api';
import { AUTH_CHANGED_EVENT } from '@/lib/auth-events';
import { NavBrowseMenus } from '@/components/NavBrowseMenus';
import { UserMenu } from '@/components/UserMenu';

const quickLinks = [
  { href: '/favorites', label: 'Yêu thích', icon: Heart },
  { href: '/history', label: 'Lịch sử', icon: History },
] as const;

const adminItem = {
  href: '/admin',
  label: 'Quản trị',
  icon: LayoutDashboard,
} as const;

type NavRole = 'ADMIN' | 'MEMBER' | null;

export default function Navbar() {
  const path = usePathname();
  const isWatchPage = path?.startsWith('/watch') ?? false;
  const [navRole, setNavRole] = useState<NavRole>(null);

  const syncNavRole = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setNavRole(null);
      return;
    }
    authApi
      .me()
      .then((u) => setNavRole(u.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'))
      .catch(() => setNavRole(null));
  }, []);

  useEffect(() => {
    syncNavRole();
  }, [path, syncNavRole]);

  useEffect(() => {
    const onAuth = () => syncNavRole();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [syncNavRole]);

  const extra =
    navRole === 'ADMIN'
      ? [adminItem]
      : navRole === 'MEMBER'
        ? [...quickLinks]
        : [];

  if (isWatchPage) {
    return (
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-[var(--tag-green)]">
              Phim
            </span>
            <span className="text-xl font-bold text-white">Web</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white"
            >
              Trang chủ
            </Link>
            <UserMenu variant="compact" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[#12151a]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3.5 md:flex-nowrap md:py-4">
        <Link href="/" className="flex shrink-0 items-center gap-1">
          <span className="text-2xl font-black tracking-tight text-[var(--tag-green)] md:text-3xl">
            Phim
          </span>
          <span className="text-2xl font-bold text-white md:text-3xl">Web</span>
        </Link>

        <div className="hidden min-w-[1rem] flex-1 md:block" />

        <div className="flex w-full items-center justify-end gap-1 sm:w-auto sm:justify-end md:gap-2">
          {extra.map(({ href, label, icon: Icon }) => {
            const active = path === href || path?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm font-medium md:px-3 ${
                  active
                    ? 'text-[var(--tag-green)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={label}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 md:h-5 md:w-5" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
          <UserMenu variant="default" />
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] bg-[#0d1016]">
        <div className="mx-auto flex min-h-[3rem] max-w-7xl items-center px-4 py-1">
          <Suspense
            fallback={
              <div className="hidden h-10 w-56 animate-pulse rounded-lg bg-zinc-800/80 md:block" />
            }
          >
            <NavBrowseMenus />
          </Suspense>
        </div>
      </div>

      <nav className="flex border-t border-[var(--border-subtle)] bg-[#0d1016] px-1 py-2 md:hidden">
        <Link
          href="/"
          className={`flex-1 rounded-md py-2.5 text-center text-xs font-semibold ${
            path === '/' ? 'text-[var(--tag-green)]' : 'text-zinc-500'
          }`}
        >
          Trang chủ
        </Link>
        {navRole === 'MEMBER' && (
          <>
            <Link
              href="/favorites"
              className={`flex-1 rounded-md py-2.5 text-center text-xs font-semibold ${
                path === '/favorites'
                  ? 'text-[var(--tag-green)]'
                  : 'text-zinc-500'
              }`}
            >
              Yêu thích
            </Link>
            <Link
              href="/history"
              className={`flex-1 rounded-md py-2.5 text-center text-xs font-semibold ${
                path === '/history'
                  ? 'text-[var(--tag-green)]'
                  : 'text-zinc-500'
              }`}
            >
              Lịch sử
            </Link>
          </>
        )}
        {navRole === 'ADMIN' && (
          <Link
            href="/admin"
            className={`flex-1 rounded-md py-2.5 text-center text-xs font-semibold ${
              path?.startsWith('/admin')
                ? 'text-[var(--tag-green)]'
                : 'text-zinc-500'
            }`}
          >
            Quản trị
          </Link>
        )}
        <button
          type="button"
          className="flex-1 rounded-md py-2.5 text-center text-xs font-semibold text-zinc-500 hover:text-zinc-300"
          onClick={() => window.alert('Chức năng chưa cập nhật.')}
        >
          Tài khoản
        </button>
      </nav>
    </header>
  );
}
