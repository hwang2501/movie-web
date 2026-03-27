import { Suspense } from 'react';
import { HomeClient } from './home-client';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-zinc-500">
          Đang tải trang chủ…
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
