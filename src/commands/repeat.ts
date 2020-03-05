import { ParsedMessage } from "discord-command-parser";
import { logBot } from "../logging_config";

// Repeats the message back to you.

function cmdRepeat(parsed: ParsedMessage) {
  logBot.debug("Sending repeat message.");
  parsed.message.channel.send(parsed.body);
}

export { cmdRepeat };
