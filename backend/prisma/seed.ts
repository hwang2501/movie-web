import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const GENRE_DEFS = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
];

const MOVIES = [
  {
    title: 'Inception',
    slug: 'inception',
    description: 'A mind-bending heist film.',
    year: 2010,
    country: 'Âu Mỹ',
    genreSlugs: ['hanh-dong', 'vien-tuong', 'tam-ly'],
  },
  {
    title: 'The Dark Knight',
    slug: 'the-dark-knight',
    description: 'Batman faces the Joker.',
    year: 2008,
    country: 'Âu Mỹ',
    genreSlugs: ['hanh-dong', 'hinh-su'],
  },
  {
    title: 'Interstellar',
    slug: 'interstellar',
    description: 'Space exploration and time dilation.',
    year: 2014,
    country: 'Âu Mỹ',
    genreSlugs: ['vien-tuong', 'tam-ly'],
  },
  {
    title: 'Titanic',
    slug: 'titanic',
    description: 'A love story on the doomed ship.',
    year: 1997,
    country: 'Âu Mỹ',
    genreSlugs: ['tinh-cam', 'gia-dinh'],
  },
  {
    title: 'Avatar',
    slug: 'avatar',
    description: "Pandora and the Na'vi.",
    year: 2009,
    country: 'Âu Mỹ',
    genreSlugs: ['vien-tuong', 'hanh-dong'],
  },
];

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const memberHash = await bcrypt.hash('member123', 10);

  /** Luôn đồng bộ admin mặc định — tránh trường hợp user đã tồn tại nhưng là MEMBER hoặc đổi mật khẩu seed không áp dụng. */
  const admin = await prisma.user.upsert({
    where: { email: 'admin@movie.web' },
    update: {
      password: adminHash,
      name: 'Admin',
      role: Role.ADMIN,
      locked: false,
    },
    create: {
      email: 'admin@movie.web',
      password: adminHash,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@movie.web' },
    update: {},
    create: {
      email: 'member@movie.web',
      password: memberHash,
      name: 'Member',
      role: Role.MEMBER,
    },
  });

  const slugToGenreId = new Map<string, string>();
  for (const g of GENRE_DEFS) {
    const row = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: g,
    });
    slugToGenreId.set(g.slug, row.id);
  }

  for (const m of MOVIES) {
    const genreSlugs = [...m.genreSlugs] as string[];
    const genreIds = genreSlugs
      .map((s) => slugToGenreId.get(s))
      .filter((id): id is string => Boolean(id));

    const movie = await prisma.movie.upsert({
      where: { slug: m.slug },
      update: {
        title: m.title,
        description: m.description,
        year: m.year,
        country: m.country,
      },
      create: {
        title: m.title,
        slug: m.slug,
        description: m.description,
        year: m.year,
        country: m.country,
      },
    });

    await prisma.movieGenre.deleteMany({ where: { movieId: movie.id } });
    if (genreIds.length) {
      await prisma.movieGenre.createMany({
        data: genreIds.map((genreId) => ({ movieId: movie.id, genreId })),
      });
    }

    for (let i = 1; i <= 3; i++) {
      await prisma.episode.upsert({
        where: {
          movieId_number: { movieId: movie.id, number: i },
        },
        update: {},
        create: {
          movieId: movie.id,
          number: i,
          title: `Episode ${i}`,
          hlsPath: `/videos/${m.slug}/ep${i}/master.m3u8`,
          duration: 3600,
        },
      });
    }

    if (m.slug === 'inception') {
      const existing = await prisma.comment.findFirst({
        where: { movieId: movie.id, userId: member.id, content: 'Great movie!' },
      });
      if (!existing) {
        await prisma.comment.create({
          data: {
            movieId: movie.id,
            userId: member.id,
            content: 'Great movie!',
          },
        });
      }
    }
  }

  console.log('Seed done:', { admin: admin.email, member: member.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
