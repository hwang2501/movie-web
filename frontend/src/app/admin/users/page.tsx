'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, RefreshCw, Shield, Lock, Unlock, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  locked: boolean;
  createdAt: string;
  googleId: string | null;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .users()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải người dùng'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setRole(id: string, role: 'ADMIN' | 'MEMBER') {
    try {
      await adminApi.patchUserRole(id, role);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không đổi được vai trò');
    }
  }

  async function setLocked(id: string, locked: boolean) {
    try {
      await adminApi.patchUserLock(id, locked);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không đổi được trạng thái khóa');
    }
  }

  async function removeUser(id: string, email: string) {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản ${email}? Hành động không hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deleteUser(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xóa được người dùng');
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Người dùng
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vai trò · khóa tài khoản (chặn đăng nhập) · xóa
          </p>
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

      {error && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] shadow-xl shadow-black/30">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 md:px-6">
          <Users className="h-5 w-5 text-[var(--accent-bright)]" />
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
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-4 font-medium md:px-6">Email</th>
                  <th className="px-4 py-4 font-medium md:px-6">Tên</th>
                  <th className="px-4 py-4 font-medium md:px-6">Google</th>
                  <th className="px-4 py-4 font-medium md:px-6">Vai trò</th>
                  <th className="px-4 py-4 font-medium md:px-6">Trạng thái</th>
                  <th className="px-4 py-4 font-medium md:px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300 md:px-6">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 md:px-6">{u.name ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500 md:px-6">
                      {u.googleId ? 'Có' : '—'}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      {u.locked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-950/50 px-2.5 py-1 text-xs font-semibold text-red-300">
                          <Lock className="h-3 w-3" />
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-400">
                          <Unlock className="h-3 w-3" />
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <div className="flex max-w-md flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={u.role === 'ADMIN'}
                            onClick={() => setRole(u.id, 'ADMIN')}
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[var(--tag-green)]/40 disabled:opacity-40"
                          >
                            Nâng admin
                          </button>
                          <button
                            type="button"
                            disabled={u.role === 'MEMBER'}
                            onClick={() => setRole(u.id, 'MEMBER')}
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 disabled:opacity-40"
                          >
                            Hạ member
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={u.locked}
                            onClick={() => setLocked(u.id, true)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-950/40 disabled:opacity-40"
                          >
                            <Lock className="h-3 w-3" />
                            Khóa
                          </button>
                          <button
                            type="button"
                            disabled={!u.locked}
                            onClick={() => setLocked(u.id, false)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-white/25 disabled:opacity-40"
                          >
                            <Unlock className="h-3 w-3" />
                            Mở khóa
                          </button>
                          <button
                            type="button"
                            onClick={() => removeUser(u.id, u.email)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-950/40"
                          >
                            <Trash2 className="h-3 w-3" />
                            Xóa
                          </button>
                        </div>
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
