import { ApplicationCommandOptionType } from "discord.js";
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
    const admin = interaction.user;
    if (!interaction.guild) {
      const guild_embed = new ErrorEmbed({
        user: admin,
        error: "This command could only be used inside a server",
        code: 405,
      });
      return interaction.reply({
        embeds: [guild_embed],
        ephemeral: true,
      });
    }
    if (!interaction.inCachedGuild()) return;
    const user = interaction.options.getUser("user");
    const member = interaction.options.getMember("user");
    if (
      !interaction.guild.members.me.permissions.has("BanMembers") ||
      !interaction.memberPermissions.has("BanMembers") ||
      !interaction.guild.members.cache.get(user.id) ||
      member?.permissions.has("Administrator") ||
      user.id === admin.id
    ) {
      const permission_embed = new ErrorEmbed({
        user: admin,
        error: "Insufficient Permissions",
        code: 403,
      });
      return interaction.reply({
        embeds: [permission_embed],
        ephemeral: true,
      });
    }
    const delete_messages =
      Number(interaction.options.getString("delete_messages")) ?? 0;
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";
    const banList = await interaction.guild.bans.fetch();
    if (banList.find((list) => (list.user.id = user.id))) {
      const already_banned_embed = new ErrorEmbed({
        user: admin,
        error: "`Cannot ban a user who is already banned",
        code: 403,
      });
      return interaction.reply({
        embeds: [already_banned_embed],
        ephemeral: true,
      });
    }
    member
      .ban({ reason, deleteMessageSeconds: delete_messages })
      .then(async () => {
        const embed_command = "Command: `Ban`"
        const embed_username = "Username: `" + user.username + "`";
        const embed_id = "ID: `" + user.id + "`";
        const embed_banned_by = "By: `" + admin.username + "`  ";
        const embed_reason = "Reason: ||" + reason + "||";
        const ban_embed = new Embed({
          user,
        })
          .setDescription(
            `${embed_command}\n${embed_username}\n${embed_id}\n${embed_banned_by}\n${embed_reason}`
          )
          .setTimestamp();
        const prisma = new PrismaClient();
        const guildId = interaction.guildId;
        const guild_find = await prisma.guild.findFirst({
          where: { guild_id: guildId },
        });
        if (guild_find.logs_channel_id) {
          const logs_channel_id = guild_find.logs_channel_id;
          const logs_channel = client.channels.cache.get(logs_channel_id);
          if (!logs_channel.isTextBased()) return;
          logs_channel.send({
            embeds: [ban_embed],
          });
        }
        return interaction.reply({
          embeds: [ban_embed],
        });
      })
      .catch((e) => {
        // console.log(e);
        const ban_error_embed = new ErrorEmbed({
          user: admin,
          error: "Insufficient Permission [ Unknown Error ]",
          code: 403,
        });
        if (!interaction.replied) {
          return interaction.reply({
            embeds: [ban_error_embed],
          });
        }
      });
  },
});
