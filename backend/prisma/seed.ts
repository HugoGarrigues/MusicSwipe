// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  
  const adminPassword = await bcrypt.hash('Admin@123', roundsOfHashing);
  const userPassword = await bcrypt.hash('User@123', roundsOfHashing);

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@musicswipe.test' },
    update: {
      password: adminPassword, 
    },
    create: {
      email: 'admin@musicswipe.test',
      username: 'admin',
      password: adminPassword,
      isAdmin: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    },
  });

  // Normal user
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@musicswipe.test' },
    update: {
      password: userPassword,
    },
    create: {
      email: 'user@musicswipe.test',
      username: 'user',
      password: userPassword,
      isAdmin: false,
      avatarUrl: 'https://i.pravatar.cc/150?u=user',
    },
  });

  // Deux tracks d’exemple
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

  // Relations de follow d'exemple
  await prisma.follow.createMany({
    data: [
      { followerId: adminUser.id, followedId: normalUser.id },
      { followerId: normalUser.id, followedId: adminUser.id },
    ],
    skipDuplicates: true,
  });

  // Ratings d'exemple (échelle 1-5)
  await prisma.rating.createMany({
    data: [
      { userId: adminUser.id,  trackId: track1.id, score: 5 },
      { userId: adminUser.id,  trackId: track2.id, score: 4 },
      { userId: normalUser.id, trackId: track1.id, score: 3 },
      { userId: normalUser.id, trackId: track2.id, score: 5 },
    ],
    // Respecte @@unique([userId, trackId]) et évite les doublons si on relance la seed
    skipDuplicates: true,
  });

  // Likes d'exemple
  await prisma.like.createMany({
    data: [
      { userId: adminUser.id,  trackId: track1.id },
      { userId: adminUser.id,  trackId: track2.id },
      { userId: normalUser.id, trackId: track1.id },
      // volontairement pas de like pour normalUser sur track2 pour varier
    ],
    // Respecte @@unique([userId, trackId]) et évite les doublons si on relance la seed
    skipDuplicates: true,
  });

  // Comments d'exemple (n'insère que si aucune donnée pour éviter les doublons à la relance)
  const commentCount = await prisma.comment.count();
  if (commentCount === 0) {
    await prisma.comment.createMany({
      data: [
        { userId: adminUser.id,  trackId: track1.id, content: "Banger absolu, l'intro est mythique." },
        { userId: adminUser.id,  trackId: track2.id, content: "Toujours un classique pour ambiancer la salle." },
        { userId: normalUser.id, trackId: track1.id, content: "J'adore le riff de guitare." },
        { userId: normalUser.id, trackId: track2.id, content: "Impossible de ne pas chanter." },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
