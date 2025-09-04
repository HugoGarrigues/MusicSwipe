// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two dummy tracks
  const track1 = await prisma.track.upsert({
    where: { spotifyId: '3n3Ppam7vgaVa1iaRUc9Lp' }, // Mr. Brightside
    update: {},
    create: {
      spotifyId: '3n3Ppam7vgaVa1iaRUc9Lp',
      title: 'Mr. Brightside',
      artistName: 'The Killers',
      albumName: 'Hot Fuss',
      duration: 222, // en secondes
      previewUrl: 'https://p.scdn.co/mp3-preview/xxxx',
    },
  });

  const track2 = await prisma.track.upsert({
    where: { spotifyId: '7GhIk7Il098yCjg4BQjzvb' }, // Never Gonna Give You Up
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

  console.log({ track1, track2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
