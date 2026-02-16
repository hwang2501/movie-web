'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-white">
          Movie Web
        </Link>
        <div className="flex gap-4">
          <Link
            href="/"
            className={path === '/' ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}
          >
            Home
          </Link>
          <Link
            href="/favorites"
            className={path === '/favorites' ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}
          >
            Favorites
          </Link>
          <Link
            href="/login"
            className={path === '/login' ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}
          >
            Login
          </Link>
          <Link
            href="/admin/movies"
            className={path?.startsWith('/admin') ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
