import { Client, Message } from "discord.js";
import { sendCheckup, sendToChannel } from "../send";
import { logBot } from "../logging_config";

// Yell at everyone on every server. This will definitely make friends.

const SERVERS: string = "EVERYONE";

function cmdScream(message: Message, client: Client) {
  const index: number = message.content.indexOf("\n");
  const title: string = message.content.substring(8, index);
  const toSend: string = message.content.substring(index + 1);

  logBot.debug("Sending scream message.");
  sendCheckup(message, SERVERS, toSend, title, client);
}

export { cmdScream };
