// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@musicswipe.test' },
    update: {},
    create: {
      email: 'admin@musicswipe.test',
      username: 'admin',
      password: 'Admin@123',
      isAdmin: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@musicswipe.test' },
    update: {},
    create: {
      email: 'user@musicswipe.test',
      username: 'user',
      password: 'User@123',
      isAdmin: false,
      avatarUrl: 'https://i.pravatar.cc/150?u=user',
    },
  });

  // Tracks
  const track1 = await prisma.track.upsert({
    where: { spotifyId: '3n3Ppam7vgaVa1iaRUc9Lp' },
    update: {},
    create: {
      spotifyId: '3n3Ppam7vgaVa1iaRUc9Lp',
      title: 'Mr. Brightside',
      artistName: 'The Killers',
      albumName: 'Hot Fuss',
      duration: 222,
      previewUrl: 'https://p.scdn.co/mp3-preview/xxxx',
    },
  });

  const track2 = await prisma.track.upsert({
    where: { spotifyId: '7GhIk7Il098yCjg4BQjzvb' },
    update: {},
    create: {
      spotifyId: '7GhIk7Il098yCjg4BQjzvb',
      title: 'Never Gonna Give You Up',
      artistName: 'Rick Astley',
      albumName: 'Whenever You Need Somebody',
      duration: 215,
      previewUrl: 'https://p.scdn.co/mp3-preview/yyyy',
    },
  });

  console.log({ adminUser, normalUser, track1, track2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
