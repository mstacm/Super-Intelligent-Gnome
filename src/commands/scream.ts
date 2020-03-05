import { Client } from "discord.js";
import { ParsedMessage } from "discord-command-parser";
import { sendCheckup } from "../send";
import { logBot, invalidCommand } from "../logging_config";
import { ValidationError, validateScream } from "../validators";

// Yell at everyone on every server. This will definitely make friends.

const SERVERS: string = "EVERYONE";

function cmdScream(parsed: ParsedMessage, client: Client) {
  try {
    validateScream(parsed);
    const message: string = parsed.body;
    const index: number = message.indexOf("\n");
    const title: string = message.substring(0, index);
    const toSend: string = message.substring(index + 1);

    logBot.debug("Sending scream message.");
    sendCheckup(parsed.message, SERVERS, toSend, title, client);
  } catch (err) {
    if (err instanceof ValidationError) {
      parsed.message.reply(err.message);
      invalidCommand(parsed);
    }
  }
}

export { cmdScream };
