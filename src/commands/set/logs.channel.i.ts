import { ChatInputCommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Embed } from "../../components/Embed";
const prisma = new PrismaClient();
export default async function run({
  interaction,
}: {
  interaction: ChatInputCommandInteraction;
}) {
  const channel = interaction.options.getChannel("channel");
  const guild_id = interaction.guildId;
  const user = interaction.user;
  await prisma.guild.update({
    where: {
      guild_id,
    },
    data: {
      logs_channel_id: channel.id,
    },
  });
  const channelNameEmbed = "Name: `#" + channel.name + "`";
  const channelIdEmbed = "ID: `" + channel.id + "`";
  const GreenEmbed = new Embed({ user })
    .setColor("Green")
    .setTitle("Updated Logs Channel")
    .setDescription(
      `> Successfully set logs channel to <#${channel.id}>\n${channelNameEmbed}\n${channelIdEmbed}`
    );
  try {
    interaction.reply({
      embeds: [GreenEmbed],
    });
  } catch (error) {
    console.log(error);
  }
}
