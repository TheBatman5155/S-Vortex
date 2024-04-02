import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Message,
} from "discord.js";
import ms from "ms";
import { Command } from "../../structure/Command";
import { Embed, ErrorEmbed } from "../../components/Embed";
import { PrismaClient } from "@prisma/client";

export default new Command({
  name: "purge",
  description: "mass delete messages",
  options: [
    {
      name: "amount",
      description: "how many messages",
      type: ApplicationCommandOptionType.Number,
      minValue: 0,
      maxValue: 100,
      required: true,
    },
  ],
  run: async ({ client, interaction }) => {
    const prisma = new PrismaClient();
    const guildId = interaction.guildId;
    const logs_channelId = (
      await prisma.guild.findFirst({ where: { guild_id: guildId } })
    )?.logs_channel_id;
    const logs_channel = client.channels.cache.get(logs_channelId) ?? null;
    const admin = interaction.user;
    const amount = interaction.options.getNumber("amount");
    if (!interaction.memberPermissions.has("ManageMessages")) {
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
      } catch (error) {}
    }
    const embed_amount = "Amount: `" + amount + " messages`";
    const purge_embed = new Embed({ user: admin })
      .setTitle(`Purge`)
      .setDescription(`${embed_amount}`)
      .setTimestamp();
    const deleteReply = (reply: Message<boolean>) => {
      setTimeout(() => {
        reply.delete().catch((e) => {
          console.log("Error deleting reply");
        });
      }, 3 * 1000);
    };
    // Send messages
    const messages = await interaction.channel.messages.fetch({
      limit: amount,
    });
    const filter = messages.filter(
      (msg) => Date.now() - msg.createdTimestamp < ms("14 days")
    );
    interaction.channel
      .bulkDelete(filter)
      .then(async () => {
        await interaction.deferReply().catch(() => console.log("Error deferring reply"));
        interaction
          .editReply({
            embeds: [purge_embed],
          })
          .then((reply) => {
            deleteReply(reply);
            if (logs_channel) {
              if (logs_channel.isTextBased()) {
                logs_channel.send({
                  embeds: [purge_embed],
                });
              }
            }
          }).catch(() => console.log("Error editing reply"));
      })
      .catch((e) => {
        const error_embed = new ErrorEmbed({
          user: admin,
          error: "Cannot delete messages over 14 days old",
          code: 403,
        });
        if (interaction.replied) return;
        interaction
          .reply({
            embeds: [error_embed],
          })
          .then((reply) => {
            reply.delete();
          })
          .catch((err) => console.log(err));
      });
  },
});
