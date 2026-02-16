'use client';

import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Phim yêu thích</h1>
      <p className="text-zinc-500">
        Đăng nhập để xem danh sách phim yêu thích.
      </p>
      <Link href="/login" className="mt-4 inline-block text-amber-400 hover:underline">
        Đăng nhập
      </Link>
    </main>
  );
}
