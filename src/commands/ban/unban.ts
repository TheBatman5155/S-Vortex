import { ApplicationCommandOptionType } from "discord.js";
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
      !interaction.memberPermissions.has("BanMembers") ||
      !interaction.guild.members.me.permissions.has("BanMembers") ||
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
    const banList = await interaction.guild.bans.fetch();
    if (!banList.find((list) => (list.user.id = user.id))) {
      const not_banned_embed = new ErrorEmbed({
        user: admin,
        error: "Cannot unban a user who isn't banned",
        code: 403,
      });
      return interaction.reply({
        embeds: [not_banned_embed],
        ephemeral: true,
      });
    }
    interaction.guild.members
      .unban(user.id)
      .then(async () => {
        const embed_command = "Command: `Unban`";
        const embed_username = "Username: `" + user.username + "`";
        const embed_id = "ID: `" + user.id + "`";
        const unban_embed = new Embed({ user })
          .setDescription(`${embed_command}\n${embed_username}\n${embed_id}`)
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
            embeds: [unban_embed],
          });
        }
        return interaction.reply({
          embeds: [unban_embed],
        });
      })
      .catch((e) => {
        console.log(e);
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
