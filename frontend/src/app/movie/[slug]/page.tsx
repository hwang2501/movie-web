'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { moviesApi, type MovieDetail } from '@/lib/api';

export default function MovieDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    moviesApi
      .bySlug(slug)
      .then(setMovie)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !movie) return <div className="p-8">Đang tải...</div>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex gap-6">
        <div className="aspect-video w-64 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
          {movie.thumbnail ? (
            <img src={movie.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🎬</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{movie.title}</h1>
          {movie.year && <p className="text-zinc-500">{movie.year}</p>}
          {movie.description && (
            <p className="mt-2 text-zinc-400">{movie.description}</p>
          )}
        </div>
      </div>
      <h2 className="mb-3 font-semibold">Tập phim</h2>
      <div className="flex flex-wrap gap-2">
        {movie.episodes.map((ep) => (
          <Link
            key={ep.id}
            href={`/watch/${movie.id}/${ep.number}`}
            className="rounded bg-zinc-800 px-4 py-2 hover:bg-amber-600"
          >
            Tập {ep.number}
          </Link>
        ))}
      </div>
    </main>
  );
}
