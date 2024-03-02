import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Collection,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { Embed, ErrorEmbed } from "../../components/Embed";
import { PrismaClient } from "@prisma/client";
import ExtendedClient from "../../structure/ExtendedClient";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ChartConfiguration } from "chart.js";
import randomColor from "randomcolor";
const prisma = new PrismaClient();
export default async function ({
  client,
  interaction,
  defaultInteraction,
  collection,
}: {
  client: ExtendedClient;
  interaction: ButtonInteraction;
  defaultInteraction: ChatInputCommandInteraction;
  collection: Collection<string, boolean>;
}) {
  const user = defaultInteraction.user;
  if (collection.get("on")) {
    const unknown_embed = new ErrorEmbed({
      user,
      error: "Unknown Poll / Poll Ended",
      code: 404,
    });
    try {
      return interaction.reply({
        embeds: [unknown_embed],
      });
    } catch (error) {
      console.log("1: " + error);
    }
  }
  try {
    const { title, description, channel_id, id } = await prisma.poll.findFirst({
      where: {
        id: defaultInteraction.id,
      },
    });
    const options = await prisma.pollOptions.findMany({
      where: {
        poll_id: id,
      },
      orderBy: {
        id: "asc",
      },
    });
    let maxNameLength = 0;
    options.forEach((opt) => {
      if (!(maxNameLength > opt.name.length)) {
        maxNameLength = opt.name.length;
      }
    });
    const logs_channelId = (
      await prisma.guild.findFirst({ where: { guild_id: interaction.guildId } })
    ).logs_channel_id;
    const logs_channel = client.channels.cache.get(logs_channelId);
    const channel = await client.channels.fetch(channel_id);
    if (!channel.isTextBased()) return;
    if (!logs_channel.isTextBased()) return;
    const optionsMap = async () => {
      const optOptions = Promise.all(
        options.map(async (option) => {
          const VotesCount = await prisma.votes.count({
            where: {
              option_id: option.id,
              interaction_id: defaultInteraction.id,
            },
          });
          return (
            (option.name + ":").padEnd(maxNameLength + 7) +
            VotesCount +
            " votes\n"
          );
        })
      );
      return optOptions;
    };
    const VoteValue = await optionsMap();
    interface PollEmbedField {
      name: string;
      value: string;
    }
    const PollEmbed = (field: PollEmbedField) => {
      return new Embed({ user })
        .addFields({ name: title, value: "```" + description + "```" }, field)
        .setFooter({
          text: `Poll started by ${defaultInteraction.user.displayName}`,
        });
    };
    const DefaultPollEmbed = PollEmbed({
      name: "Votes",
      value: "```" + VoteValue.join("") + "```",
    });
    const PollSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("PollSelectMenu" + interaction.user.id)
      .setPlaceholder("Click here to vote!")
      .addOptions(
        options.map((option, i) => {
          return new StringSelectMenuOptionBuilder()
            .setLabel(option.name)
            .setDescription(`Vote for option number ${i + 1}`)
            .setValue(option.id);
        })
      );
    const PollSelectMenuActionRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        PollSelectMenu
      );
    const pollMessage = await channel.send({
      embeds: [DefaultPollEmbed],
      components: [PollSelectMenuActionRow],
    });
    const filter = (i: StringSelectMenuInteraction) => {
      return "PollSelectMenu" + interaction.user.id == i.customId;
    };
    const pollByUsername = "Poll By: `" + user.displayName + "`";
    const votedByUsername = "Username `" + interaction.user.id + "`";
    const pollByID = "User ID: `" + interaction.user.id + "`";
    const pollID = "Message ID: `" + interaction.id + "`";
    const pollChannelID = "Channel ID: `" + channel_id + "`";
    const successEmbed = new Embed({ user })
      .setColor("Green")
      .setTitle("Sent Poll")
      .setDescription(
        `${pollByUsername}\n${votedByUsername}\n${pollByID}\n${pollID}\n${pollChannelID}`
      );
    const collector = pollMessage.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter,
      idle: 24 * 60 * 60 * 1000,
    });
    try {
      logs_channel.send({
        embeds: [successEmbed],
      });
      interaction.reply({
        embeds: [successEmbed],
      });
    } catch (e) {
      console.log("2: " + e);
    }
    const Bill: Collection<string, number> = new Collection();
    Bill.set(interaction.user.id + defaultInteraction.id, 0);
    const Color = [];
    for (let i = 0; i < options.length; i++) {
      Color.push(randomColor());
    }
    collector.on("collect", async (int) => {
      if (!int.values.length) {
        const permission_embed = new ErrorEmbed({
          user,
          error: "Unknown Value",
          code: 404,
        });
        int.editReply({
          embeds: [permission_embed],
        });
        return;
      }
      options.forEach(async (opt) => {
        if (int.values.includes(opt.id)) {
          const CoolBill: any = Bill.get(
            interaction.user.id + defaultInteraction.id
          );
          if (CoolBill > 0) return;

          await int.deferReply({ ephemeral: true, fetchReply: true });
          await prisma.votes.upsert({
            where: {
              id: defaultInteraction.id + defaultInteraction.user.id,
              voter_id: int.user.id,
              interaction_id: defaultInteraction.id,
            },
            create: {
              id: defaultInteraction.id + defaultInteraction.user.id,
              voter_id: int.user.id,
              interaction_id: defaultInteraction.id,
              option_id: opt.id,
            },
            update: {
              option_id: opt.id,
            },
          });
          const counts = await Promise.all(
            options.map(async (opt) => {
              return prisma.votes.count({
                where: {
                  option_id: opt.id,
                },
              });
            })
          );

          const optFetchCount = await prisma.votes.count({
            where: {
              option_id: opt.id,
            },
          });
          const chartConfig: ChartConfiguration = {
            type: "pie",
            data: {
              labels: options.map((opt) => opt.name),
              datasets: [
                {
                  data: counts,
                  backgroundColor: Color,
                },
              ],
            },
          };
          const chartJSNodeCanvas = new ChartJSNodeCanvas({
            height: 300,
            width: 300,
            backgroundColour: "white",
          });
          const chartImage = await chartJSNodeCanvas.renderToBuffer(
            chartConfig
          );
          const chartAttachment = new AttachmentBuilder(chartImage, {
            name: "ChartAttachmentPoll.png",
            description: "chart image",
          });
          const dm = await int.user.createDM();
          const currentVotes = "Current Votes: `" + optFetchCount + "`";
          const dmEmbed = new Embed({ user: int.user })
            .setTitle("Updated Vote")
            .setDescription(
              `${pollByUsername}\n${pollByID}\n${pollID}\n${pollChannelID}\n${currentVotes}`
            );
          const NewVoteValue = await optionsMap();
          const newPollEmbed = PollEmbed({
            name: "Votes",
            value: "```" + NewVoteValue.join("") + "```",
          }).setImage(`attachment://${chartAttachment.name}`);
          try {
            dm.send({
              embeds: [dmEmbed],
            });
            await pollMessage.edit({
              embeds: [newPollEmbed],
              files: [chartAttachment],
            });
            const CoolEmbed = new EmbedBuilder().setDescription(
              "You will be able to change to vote in `30` seconds"
            );

            await int.editReply({
              embeds: [dmEmbed, CoolEmbed],
            });
            for (let i = 30 - 1; i > 0; i--) {
              setTimeout(async () => {
                const CoolEmbed = new EmbedBuilder().setDescription(
                  "You will be able to change the vote in `" + i + "` seconds"
                );
                await int.editReply({
                  embeds: [dmEmbed, CoolEmbed],
                });
                if (i <= 1) {
                  const CoolEmbed = new EmbedBuilder().setDescription(
                    "You can change the vote now"
                  );
                  await int.editReply({
                    embeds: [dmEmbed, CoolEmbed],
                  });
                  Bill.set(interaction.user.id + defaultInteraction.id, 0);
                }
              }, 1000);
            }
          } catch (e) {
            const guild_embed = new ErrorEmbed({
              user: int.user,
              error: "DMs Closed",
              code: 403,
            });
            int.editReply({
              embeds: [guild_embed],
            });
            console.log("3: " + e);
          }
          Bill.set(interaction.user.id + defaultInteraction.id, 30 * 1000);
          return;
        }
      });
    });
  } catch (e) {
    const permission_embed = new ErrorEmbed({
      user,
      error: "Insufficient Information [ Click the **Settings** Button First ]",
      code: 403,
    });
    console.log("4: " + e);
    try {
    } catch (error) {
      console.log("5: " + error);
    }
    interaction.reply({
      embeds: [permission_embed],
      ephemeral: true,
    });
    return;
  }
}
