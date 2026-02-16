import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const memberHash = await bcrypt.hash('member123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@movie.web' },
    update: {},
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

  const movies = [
    { title: 'Inception', slug: 'inception', description: 'A mind-bending heist film.', year: 2010 },
    { title: 'The Dark Knight', slug: 'the-dark-knight', description: 'Batman faces the Joker.', year: 2008 },
    { title: 'Interstellar', slug: 'interstellar', description: 'Space exploration and time dilation.', year: 2014 },
    { title: 'Titanic', slug: 'titanic', description: 'A love story on the doomed ship.', year: 1997 },
    { title: 'Avatar', slug: 'avatar', description: 'Pandora and the Na\'vi.', year: 2009 },
  ];

  for (const m of movies) {
    const movie = await prisma.movie.upsert({
      where: { slug: m.slug },
      update: {},
      create: m,
    });

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
