import { ParsedMessage } from "discord-command-parser";
import { logBot } from "../logging_config";
import { validateRepeat } from "../validators";

// Repeats the message back to you.

function cmdRepeat(parsed: ParsedMessage) {
  validateRepeat(parsed);
  logBot.warn("Sending repeat message.");
  parsed.message.channel.send(parsed.body);
}
export { cmdRepeat };
