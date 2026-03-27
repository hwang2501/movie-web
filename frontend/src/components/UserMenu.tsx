'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserRound,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { notifyAuthChanged } from '@/lib/auth-events';

export type MeUser = {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  googleId: string | null;
  role: string;
};

function initialsFromUser(u: MeUser) {
  const base = (u.name || u.email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return base.slice(0, 2).toUpperCase();
}

type Props = {
  /** 'default' = nút đầy trên navbar chính; 'compact' = trang watch */
  variant?: 'default' | 'compact';
};

export function UserMenu({ variant = 'default' }: Props) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      return;
    }
    authApi
      .me()
      .then((u) =>
        setUser({
          id: u.id,
          email: u.email,
          name: u.name,
          imageUrl: u.imageUrl,
          googleId: u.googleId,
          role: u.role,
        }),
      )
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    load();
  }, [load, path]);

  useEffect(() => {
    if (!open) return;
    function onDoc(ev: MouseEvent) {
      if (!rootRef.current?.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  async function logout() {
    const rt = localStorage.getItem('refreshToken');
    try {
      if (rt) await authApi.logout(rt);
    } catch {
      /* still clear local */
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setOpen(false);
    notifyAuthChanged();
    router.push('/');
    router.refresh();
  }

  if (user === undefined) {
    return (
      <div
        className={
          variant === 'compact'
            ? 'h-8 w-8 animate-pulse rounded-full bg-zinc-800'
            : 'h-9 w-9 animate-pulse rounded-full bg-zinc-800'
        }
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={
          variant === 'compact'
            ? 'flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)]'
            : `flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition ${
                path === '/login'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-elevated)] text-zinc-200 hover:bg-[var(--accent)] hover:text-white'
              }`
        }
      >
        <LogIn className="h-4 w-4" />
        <span className={variant === 'compact' ? '' : 'hidden sm:inline'}>Đăng nhập</span>
      </Link>
    );
  }

  const compact = variant === 'compact';

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[#0d1016] py-1 pl-1 pr-2 transition hover:border-[var(--tag-green)]/40 ${
          compact ? 'pr-1.5' : ''
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt=""
            className={`rounded-full object-cover ${compact ? 'h-7 w-7' : 'h-8 w-8'}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className={`flex items-center justify-center rounded-full bg-[var(--tag-green)]/20 text-[10px] font-bold text-[var(--tag-green)] ${
              compact ? 'h-7 w-7' : 'h-8 w-8'
            }`}
          >
            {initialsFromUser(user)}
          </span>
        )}
        {!compact && (
          <ChevronDown className={`h-4 w-4 text-zinc-500 transition ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-[100] mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] py-1 shadow-2xl shadow-black/50"
          role="menu"
        >
          <div className="border-b border-white/10 px-3 py-3">
            <p className="truncate text-sm font-semibold text-white">
              {user.name || 'Thành viên'}
            </p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
            {user.googleId && (
              <p className="mt-1 text-[10px] text-zinc-600">Đăng nhập qua Google</p>
            )}
          </div>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            onClick={() => {
              setOpen(false);
              window.alert('Chức năng chưa cập nhật.');
            }}
          >
            <UserRound className="h-4 w-4 text-[var(--tag-green)]" />
            Tài khoản &amp; ảnh đại diện
          </button>
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4 text-[var(--accent-bright)]" />
              Bảng quản trị
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-red-200"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
