import { Collection } from "discord.js";

export default function run({
  collection,
}: {
  collection: Collection<string, boolean>;
}) {
  collection.set("on", true);
}
