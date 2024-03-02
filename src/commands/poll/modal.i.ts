import {
  ButtonInteraction,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { Embed } from "../../components/Embed";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function run({
  interaction,
  defaultInteraction,
}: {
  interaction: ButtonInteraction;
  defaultInteraction: ChatInputCommandInteraction;
}) {
  const user = defaultInteraction.user;
  const modal = new ModalBuilder({
    customId: "PollSettingModal" + interaction.id,
    title: "Poll Settings",
  });
  const PollTitle = new TextInputBuilder({
    customId: "PollSettingsModalPollTitle",
    label: "Poll Title",
    style: TextInputStyle.Short,
    placeholder: "Title shown in the poll Embed",
    // value: "Poll Preview",
  });
  const PollTitleActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(PollTitle);
  const PollDesc = new TextInputBuilder({
    customId: "PollSettingsModalPollDesc",
    label: "Poll Description",
    style: TextInputStyle.Short,
    placeholder: "Description shown in the poll Embed",
    // value: "Rate this poll?",
  });
  const PollDescActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(PollDesc);
  const PollOpt = new TextInputBuilder({
    customId: "PollSettingsModalPollOpt",
    label: "Options (One per line, Max 9)",
    style: TextInputStyle.Paragraph,
    placeholder: "Options to be chosen in the poll",
    // value: "Bad\nAverage\nGood",
  });
  const PollOptActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(PollOpt);

  const PollChannelID = new TextInputBuilder({
    customId: "PollSettingsModalPollChannelID",
    label: "Channel ID ( Optional )",
    style: TextInputStyle.Short,
    placeholder: "Where should the poll be?",
    required: false,
    // value: "1201168427285491752"
  });
  const PollChannelIDActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(PollChannelID);
  modal.addComponents(
    PollTitleActionRow,
    PollDescActionRow,
    PollOptActionRow,
    PollChannelIDActionRow
  );
  await interaction.showModal(modal);
  const filter = (i: ModalSubmitInteraction) =>
    i.customId === "PollSettingModal" + interaction.id;
  interaction
    .awaitModalSubmit({ filter, time: 2 * 60 * 1000 })
    .then(async (modalInteraction) => {
      const PollTitleVal = modalInteraction.fields.getTextInputValue(
        "PollSettingsModalPollTitle"
      );
      const PollDescVal = modalInteraction.fields.getTextInputValue(
        "PollSettingsModalPollDesc"
      );
      const PollOptVal = modalInteraction.fields
        .getTextInputValue("PollSettingsModalPollOpt")
        .replace(",", "");
      const PollChannelIDVal = modalInteraction.fields.getTextInputValue(
        "PollSettingsModalPollChannelID"
      );
      const PollChannelIDValR = PollChannelIDVal
        ? PollChannelIDVal
        : defaultInteraction.channel.id;
      const optionsArray = PollOptVal.split("\n");
      interface PollOptions {
        id: string;
        name: string;
        poll_id?: string;
        votes?: number;
      }
      const PollOptionsArray: PollOptions[] = [];
      optionsArray.forEach((option, index) => {
        const PollOption: PollOptions = {
          id: defaultInteraction.id + index,
          name: option,
        };
        return PollOptionsArray.push(PollOption);
      });
      await prisma.poll.upsert({
        where: {
          id: defaultInteraction.id,
        },
        create: {
          title: PollTitleVal,
          channel_id: PollChannelIDValR,
          description: PollDescVal,
          guild_id: modalInteraction.guild.id,
          id: defaultInteraction.id,
        },
        update: {
          title: PollTitleVal,
          channel_id: PollChannelIDValR,
          description: PollDescVal,
        },
      });
      await prisma.pollOptions.deleteMany({
        where: {
          poll_id: defaultInteraction.id,
        },
      });
      optionsArray.forEach(async (opt, index) => {
        await prisma.pollOptions.create({
          data: {
            id: defaultInteraction.id + index,
            name: opt,
            poll_id: defaultInteraction.id,
          },
        });
      });
      const optionsMap = optionsArray.map((opt, i) => {
        return "```" + (i + 1) + ". " + opt + "```";
      });
      const SuccessEmbed = new Embed({ user })
        .setColor("Green")
        .setTitle("Settings successfully saved")
        .setDescription(
          "> You can change these settings by pressing the **Settings** button again. If there are no changes then you can continue by clicking the **Send Poll** button"
        )
        .addFields(
          {
            name: "Title",
            value: "```" + PollTitleVal + "```",
            inline: true,
          },
          {
            name: "Description",
            value: "```" + PollDescVal + "```",
            inline: true,
          },
          {
            name: "Channel",
            value: `<#${PollChannelIDValR}>`,
            inline: true,
          },
          {
            name: "Options",
            value: optionsMap.join(""),
          }
        );
      try {
        modalInteraction.reply({
          embeds: [SuccessEmbed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    });
}
