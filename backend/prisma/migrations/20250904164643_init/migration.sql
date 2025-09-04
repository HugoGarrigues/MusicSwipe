-- CreateTable
CREATE TABLE "public"."Track" (
    "id" SERIAL NOT NULL,
    "spotifyId" TEXT,
    "title" TEXT NOT NULL,
    "artistName" TEXT,
    "albumName" TEXT,
    "duration" INTEGER,
    "previewUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyId_key" ON "public"."Track"("spotifyId");
