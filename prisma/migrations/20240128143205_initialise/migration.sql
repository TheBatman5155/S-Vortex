-- CreateTable
CREATE TABLE "guild" (
    "id" SERIAL NOT NULL,
    "guild_id" TEXT NOT NULL,
    "logs_channel_id" TEXT,

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,

    CONSTRAINT "poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pollOptions" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "pollOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "voter_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "interaction_id" TEXT NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guild_guild_id_key" ON "guild"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "guild_logs_channel_id_key" ON "guild"("logs_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "poll_id_key" ON "poll"("id");

-- AddForeignKey
ALTER TABLE "poll" ADD CONSTRAINT "poll_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("guild_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pollOptions" ADD CONSTRAINT "pollOptions_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "pollOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
