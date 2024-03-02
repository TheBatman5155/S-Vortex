import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Interaction,
  time,
} from "discord.js";
import { Command } from "../../structure/Command";
import { Embed, ErrorEmbed } from "../../components/Embed";
import { PrismaClient } from "@prisma/client";
export default new Command({
  name: "unban",
  description: "unban user",
  options: [
    {
      name: "user",
      description: "target user",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  run: async ({ client, interaction }) => {
    // Constructing
    if (!interaction.inCachedGuild()) return;
    const prisma = new PrismaClient();
    const guildId = interaction.guildId;
    const logs_channelId = (
      await prisma.guild.findFirst({ where: { guild_id: guildId } })
    ).logs_channel_id;
    const logs_channel = client.channels.cache.get(logs_channelId);
    const user = interaction.options.getUser("user");
    const admin = interaction.user;
    if (!interaction.guild) {
      const guild_embed = new ErrorEmbed({
        user: admin,
        error: "The command can only be used inside a server",
        code: 405,
      });
      try {
        return interaction.reply({
          embeds: [guild_embed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
    if (!interaction.memberPermissions.has("BanMembers")) {
      const permission_embed = new ErrorEmbed({
        user: admin,
        error: "Insufficient Permissions",
        code: 403,
      });
      try {
        return interaction.reply({
          embeds: [permission_embed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
    const banList = await interaction.guild.bans.fetch();
    if (!banList.find((list) => (list.user.id = user.id))) {
      const you_embed = new ErrorEmbed({
        user: admin,
        error: "Cannot unban a person who isn't banned",
        code: 403,
      });
      try {
        return interaction.reply({
          embeds: [you_embed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    }
    try {
      await interaction.guild.members.unban(user.id);
      // Embed
      const embed_username = "Username: `" + user.username + "`";
      const embed_id = "ID: `" + user.id + "`";
      const embed_unbanned_by = "By: `" + admin.username + "`  ";
      const unban_embed = new Embed({ user })
        .setTitle(`Unban ${user.displayName}`)
        .setDescription(
          `> Successfully unbanned ${user.displayName}\n${embed_username}\n${embed_id}\n`
        )
        .setTimestamp();

      // Send messages
      if (logs_channel.isTextBased()) {
        logs_channel.send({
          embeds: [unban_embed],
        });
      }
      try {
        interaction.reply({
          embeds: [unban_embed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      console.log(e);
      // interaction.reply({ content: `${e}`, ephemeral: true });
    }
  },
});
