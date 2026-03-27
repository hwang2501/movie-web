'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Tags, Users, Clapperboard } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    users: number;
    movies: number;
    episodes: number;
    genres: number;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Không tải được thống kê'));
  }, []);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
      <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
        Bảng điều khiển
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Tổng quan nội dung và người dùng</p>

      {err && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Người dùng', value: stats?.users, icon: Users, href: '/admin/users' },
          { label: 'Phim', value: stats?.movies, icon: Film, href: '/admin/movies' },
          { label: 'Tập phim', value: stats?.episodes, icon: Clapperboard, href: '/admin/movies' },
          { label: 'Thể loại', value: stats?.genres, icon: Tags, href: '/admin/genres' },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-2xl border border-white/10 bg-[var(--surface)] p-6 shadow-lg shadow-black/20 transition hover:border-[var(--tag-green)]/30"
          >
            <card.icon className="h-8 w-8 text-[var(--accent-bright)] opacity-90 group-hover:text-[var(--tag-green)]" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {!stats && !err ? '—' : card.value ?? '0'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
