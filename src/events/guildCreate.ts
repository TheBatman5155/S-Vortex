import { PrismaClient } from "@prisma/client";
import { Event } from "../structure/Event";
const prisma = new PrismaClient();
export default new Event("guildCreate", async (guild) => {
  await prisma.guild.create({
    data: {
      guild_id: guild.id,
    },
  });
});
