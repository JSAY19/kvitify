-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('DAILY_CHECKIN', 'CRAVING', 'RELAPSE', 'MILESTONE');

-- CreateEnum
CREATE TYPE "AIInteractionType" AS ENUM ('CRAVING_SUPPORT', 'RECOMMENDATION', 'MOTIVATION', 'CHAT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pushSubscription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmokingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quitDate" TIMESTAMP(3) NOT NULL,
    "cigarettesPerDay" INTEGER NOT NULL,
    "pricePerPack" DOUBLE PRECISION NOT NULL,
    "cigarettesPerPack" INTEGER NOT NULL DEFAULT 20,
    "smokingYears" INTEGER,
    "motivation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmokingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "LogType" NOT NULL,
    "cravingLevel" INTEGER,
    "mood" INTEGER,
    "notes" TEXT,
    "cigarettesSmoked" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "type" "AIInteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SmokingProfile_userId_key" ON "SmokingProfile"("userId");

-- CreateIndex
CREATE INDEX "ProgressLog_userId_date_idx" ON "ProgressLog"("userId", "date");

-- CreateIndex
CREATE INDEX "AIInteraction_userId_createdAt_idx" ON "AIInteraction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "SmokingProfile" ADD CONSTRAINT "SmokingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
