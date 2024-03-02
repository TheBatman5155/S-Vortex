import { PrismaClient } from "@prisma/client";
import { Event } from "../structure/Event";
// const prisma = new PrismaClient();
export default new Event("ready", async (interaction) => {
  // interface Guild {
  //   guild_id: string;
  // }
  // const Guilds: Guild[] = interaction.guilds.cache.map((guild) => {
  //   return { guild_id: guild.id };
  // });
  // await prisma.guild.createMany({
  //   data: Guilds,
  // });
  console.log("Connected");
});
