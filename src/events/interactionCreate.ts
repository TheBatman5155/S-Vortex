import { ChatInputCommandInteraction } from "discord.js";
import { client } from "..";
import { Event } from "../structure/Event";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default new Event("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  const fetchUser = await prisma.user.findFirst({
    where: {
      id: interaction.user.id
    }
  })
  if (!command) return;
  try {
    command?.run({
      client,
      interaction: interaction as ChatInputCommandInteraction,
    });
  } catch (e) {
    console.log(e);
  }
  if (!fetchUser) {
    await prisma.user.create({
      data: {
        id: interaction.user.id,
        username: interaction.user.username
      }
    })
    return;
  }
});
