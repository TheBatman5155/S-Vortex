import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../../structure/Command";
import { Embed, ErrorEmbed } from "../../components/Embed";
import { PrismaClient } from "@prisma/client";

export default new Command({
  name: "kick",
  description: "kick user",
  options: [
    {
      name: "user",
      description: "target user",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "reason for kick",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  run: async ({ client, interaction }) => {
    if (!interaction.inCachedGuild()) return;
    const prisma = new PrismaClient();
    const guildId = interaction.guildId;
    const logs_channelId = (
      await prisma.guild.findFirst({ where: { guild_id: guildId } })
    ).logs_channel_id;
    const logs_channel = client.channels.cache.get(logs_channelId);
    const user = interaction.options.getUser("user");
    const member = interaction.options.getMember("user");
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
      } catch (error) {
        ;
      }
    }
    if (!interaction.memberPermissions.has("KickMembers")) {
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
        ;
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
      } catch (error) {
        ;
      }
    }
    if (member?.permissions.has("Administrator")) {
      const you_embed = new ErrorEmbed({
        user: admin,
        error: "Cannot ban an administrator",
        code: 403,
      });
    }
    try {
      await member.kick();

      // Embed
      const embed_username = "Username: `" + user.username + "`";
      const embed_id = "ID: `" + user.id + "`";
      const embed_kicked_by = "By: `" + admin.username + "`  ";
      const embed_reason = "Reason: ||" + reason + "||";
      const kick_embed = new Embed({ user })
        .setTitle(`Kick ${user.displayName}`)
        .setDescription(
          `> Successfully kicked ${user.displayName}\n${embed_username}\n${embed_id}\n${embed_kicked_by}\n${embed_reason}`
        )
        .setTimestamp();

      // Send message
      if (logs_channel.isTextBased()) {
        logs_channel.send({
          embeds: [kick_embed],
        });
      }
      try {
        interaction.reply({
          embeds: [kick_embed],
          ephemeral: true,
        });
      } catch (error) {
        ;
      }
    } catch (e) {
      ;
      // interaction.reply({ content: `${e}`, ephemeral: true });
    }
  },
});
