'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { moviesApi, commentsApi, type MovieDetail, type Comment } from '@/lib/api';

export default function WatchPage() {
  const params = useParams();
  const movieId = params?.movieId as string;
  const epNum = Number(params?.ep);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    Promise.all([moviesApi.byId(movieId), commentsApi.byMovie(movieId)])
      .then(([m, c]) => {
        setMovie(m);
        setComments(c);
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  const ep = movie?.episodes.find((e) => e.number === epNum);

  if (loading || !movie) return <div className="p-8">Đang tải...</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href={`/movie/${movie.slug}`} className="mb-4 text-amber-400 hover:underline">
        ← {movie.title}
      </Link>
      <div className="aspect-video rounded-lg bg-black">
        {ep ? (
          <p className="flex h-full items-center justify-center text-zinc-500">
            Player HLS: {ep.hlsPath}
          </p>
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">
            Không tìm thấy tập
          </div>
        )}
      </div>
      <div className="mt-6">
        <h3 className="mb-2 font-semibold">Bình luận ({comments.length})</h3>
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded bg-zinc-900 p-3">
              <p className="text-sm text-zinc-500">{c.user.name ?? c.user.email}</p>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
