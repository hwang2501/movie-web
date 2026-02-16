'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

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
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-2"
          required
        />
        <input
          type="text"
          placeholder="Tên (tùy chọn)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-2"
        />
        <input
          type="password"
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-2"
          required
          minLength={6}
        />
        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-amber-600 py-2 font-medium hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>
      <p className="mt-4 text-zinc-500">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-amber-400 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </main>
  );
}
