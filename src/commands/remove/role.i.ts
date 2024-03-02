import { ChatInputCommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Embed, ErrorEmbed } from "../../components/Embed";
import ExtendedClient from "../../structure/ExtendedClient";
export default async function run({
  client,
  interaction,
}: {
  client: ExtendedClient;
  interaction: ChatInputCommandInteraction;
}) {
  if (!interaction.inCachedGuild()) return;
  const member = interaction.options.getMember("user");
  const user = interaction.user;
  const role = interaction.options.getRole("role");
  if (!member.roles.cache.has(role.id)) {
    const AssignEmbed = new ErrorEmbed({
      user,
      code: 404,
      error: "Cannot remove a role from a person who doesn't have the role",
    });
    try {
      return interaction.reply({
        embeds: [AssignEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
  if (!interaction.memberPermissions.has("ManageRoles")) {
    const permission_embed = new ErrorEmbed({
      user,
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
  member.roles
    .remove(role)
    .then(() => {
      const memberNameEmbed = "Username: `" + member.displayName + "`";
      const memberIDEmbed = "User ID: `" + member.id + "`";
      const roleNameEmbed = "Role name: `" + role.name + "`";
      const roleIDEmbed = "Role ID: `" + role.id + "`";
      const GreenEmbed = new Embed({ user })
        .setColor("Green")
        .setTitle("Role Removed")
        .setDescription(
          `> Removed role <@${role.id}> from <@${user.id}>\n${memberNameEmbed}\n${memberIDEmbed}\n${roleNameEmbed}\n${roleIDEmbed}`
        );
      try {
        interaction.reply({
          embeds: [GreenEmbed],
        });
      } catch (error) {
        console.log(error);
      }
    })
    .catch((e) => {
      const RoleBelowEmbed = new ErrorEmbed({
        user,
        code: 403,
        error:
          "Insufficient Permissions. [ Bot ]`\nValidation: `Place the bot role higher than the role removing",
      });
      console.log(e);
      try {
        interaction.reply({
          content: `${e}`,
          embeds: [RoleBelowEmbed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    });
}
