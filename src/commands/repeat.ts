import { Client, Message } from "discord.js";
import { sendCheckup } from "../send";

// Repeats the message back to you.

function cmdRepeat(message: Message, client: Client) {
  const index: number = message.content.indexOf("\n");
  const title: string = message.content.substring(8, index);
  const toSend: string = message.content.substring(index + 1);
  if (toSend.length >= 1) {
    sendCheckup(message, "HERE", toSend, title, client);
  }
}

export { cmdRepeat };
