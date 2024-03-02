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
  name: "ban",
  description: "ban user",
  options: [
    {
      name: "user",
      description: "target user",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "reason for ban",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "delete_messages",
      description: "BOOM",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Previous Hour",
          value: `${60 * 60}`,
        },
        {
          name: "Previous 24 Hours",
          value: `${60 * 60 * 24}`,
        },
        {
          name: "Previous 7 Days",
          value: `${60 * 60 * 24 * 7}`,
        },
      ],
      required: false,
    },
  ],
  run: async ({ client, interaction }) => {
    // Constructing
    const prisma = new PrismaClient();
    const guildId = interaction.guildId;
    const logs_channelId = (
      await prisma.guild.findFirst({ where: { guild_id: guildId } })
    ).logs_channel_id;
    const logs_channel = client.channels.cache.get(logs_channelId);
    if (!interaction.inCachedGuild()) return;
    const user = interaction.options.getUser("user");
    const member = interaction.options.getMember("user");
    const delete_messages =
      Number(interaction.options.getString("delete_messages")) ?? 0;
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";
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
      } catch (e) {
        console.log(e);
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
      } catch (e) {
        console.log(e);
      }
    }
    if (user.id === admin.id) {
      const you_embed = new ErrorEmbed({
        user: admin,
        error: "Cannot ban yourself",
        code: 403,
      });
      try {
        return interaction.reply({
          embeds: [you_embed],
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    const banList = await interaction.guild.bans.fetch();
    if (banList.find((list) => (list.user.id = user.id))) {
      const you_embed = new ErrorEmbed({
        user: admin,
        error: "Cannot ban a person who is already banned",
        code: 403,
      });
      try {
        return interaction.reply({
          embeds: [you_embed],
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    if (member?.permissions.has("Administrator")) {
      const you_embed = new ErrorEmbed({
        user: admin,
        error: "Cannot ban an administrator",
        code: 403,
      });
      try {
        return interaction.reply({
          embeds: [you_embed],
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    try {
      await member.ban({ reason, deleteMessageSeconds: delete_messages });
      // Embed
      const embed_username = "Username: `" + user.username + "`";
      const embed_id = "ID: `" + user.id + "`";
      const embed_banned_by = "By: `" + admin.username + "`  ";
      const embed_reason = "Reason: ||" + reason + "||";
      const ban_embed = new Embed({
        user,
      })
        .setTitle(`Ban ${user.displayName}`)
        .setDescription(
          `> Successfully banned ${user.displayName}\n${embed_username}\n${embed_id}\n${embed_banned_by}\n${embed_reason}`
        )
        .setTimestamp();

      // Send Messages
      if (logs_channel.isTextBased()) {
        logs_channel.send({
          embeds: [ban_embed],
        });
      }
      try {
        interaction.reply({
          embeds: [ban_embed],
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);
      // interaction.reply({ content: `${e}`, ephemeral: true });
    }
  },
});
