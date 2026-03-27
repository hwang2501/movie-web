import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border-subtle)] bg-[#12151a]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-black text-[var(--tag-green)]">
              Phim<span className="font-bold text-white">Web</span>
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Xem phim HD, Vietsub — danh mục và dữ liệu do hệ thống quản lý.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-zinc-300">Danh mục</p>
              <ul className="space-y-1.5 text-zinc-500">
                <li>
                  <Link href="/" className="hover:text-[var(--tag-green)]">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/#phim-bo" className="hover:text-[var(--tag-green)]">
                    Phim bộ
                  </Link>
                </li>
                <li>
                  <Link href="/#phim-le" className="hover:text-[var(--tag-green)]">
                    Phim lẻ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-zinc-300">Cá nhân</p>
              <ul className="space-y-1.5 text-zinc-500">
                <li>
                  <Link href="/favorites" className="hover:text-[var(--tag-green)]">
                    Yêu thích
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="hover:text-[var(--tag-green)]">
                    Lịch sử xem
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[var(--tag-green)]">
                    Đăng nhập
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-[var(--border-subtle)] pt-6 text-center text-[11px] text-zinc-600">
          © {new Date().getFullYear()} Phim Web
        </p>
      </div>
    </footer>
  );
}
