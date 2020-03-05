import { Client, Message } from "discord.js";
import { sendCheckup } from "../send";
import { logBot } from "../logging_config";

// Repeats the message back to you.

function cmdRepeat(message: Message, client: Client) {
  const index: number = message.content.indexOf("\n");
  const title: string = message.content.substring(8, index);
  const toSend: string = message.content.substring(index + 1);
  if (toSend.length >= 1) {
    logBot.debug("Sending repeat message.");
    sendCheckup(message, "HERE", toSend, title, client);
  } else {
    logBot.debug("Repeat message was too short.");
  }
}

export { cmdRepeat };
