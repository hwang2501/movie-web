import type { ReactNode } from 'react';
import Link from 'next/link';
import { Clapperboard, Film, LayoutDashboard, Tags, Users } from 'lucide-react';

const navLink =
  'flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white md:whitespace-normal';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col bg-[var(--background)] md:flex-row">
      <aside className="shrink-0 border-b border-white/10 bg-[var(--surface)] md:w-52 md:border-b-0 md:border-r lg:w-56 xl:w-60">
        <div className="sticky top-16 p-3 md:top-0 md:px-3 md:py-8 lg:px-4">
          <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 md:mb-4">
            Quản trị
          </p>
          <nav className="flex flex-row gap-0.5 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            <Link href="/admin" className={navLink}>
              <LayoutDashboard className="h-4 w-4 shrink-0 text-[var(--accent-bright)]" />
              Tổng quan
            </Link>
            <Link href="/admin/movies" className={navLink}>
              <Film className="h-4 w-4 shrink-0 text-[var(--accent-bright)]" />
              Phim
            </Link>
            <Link href="/admin/genres" className={navLink}>
              <Tags className="h-4 w-4 shrink-0 text-[var(--accent-bright)]" />
              Thể loại
            </Link>
            <Link href="/admin/users" className={navLink}>
              <Users className="h-4 w-4 shrink-0 text-[var(--accent-bright)]" />
              Người dùng
            </Link>
            <Link
              href="/"
              className="mt-1 flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white md:mt-5"
            >
              <Clapperboard className="h-4 w-4" />
              Về trang xem
            </Link>
          </nav>
        </div>
      </aside>
      <div className="min-w-0 w-full flex-1">{children}</div>
    </div>
  );
}
