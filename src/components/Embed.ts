import { EmbedBuilder, User } from "discord.js";

export class Embed extends EmbedBuilder {
  constructor({ user }: { user: User }) {
    super();
    this.setAuthor({
      name: user.displayName,
      iconURL: user.displayAvatarURL(),
    }).setColor("DarkerGrey");
  }
}
export class ErrorEmbed extends Embed {
  constructor({
    user,
    error,
    code,
  }: {
    user: User;
    error: string;
    code: number | string;
  }) {
    super({ user });
    this.setDescription(
      "Error: `" + error + "`\nStatus Code: `" + code + "`\n"
    ).setTimestamp();
  }
}
