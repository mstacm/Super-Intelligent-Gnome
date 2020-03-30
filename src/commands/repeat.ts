import { ParsedMessage } from "discord-command-parser";
import { logBot } from "../logging_config";
import { isAuthenticated } from "../authenticators";
import { validateRepeat } from "../validators";

// Repeats the message back to you.

function cmdRepeat(parsed: ParsedMessage) {
  isAuthenticated(parsed, "officer");
  validateRepeat(parsed);
  logBot.debug("Sending repeat message.");
  parsed.message.channel.send(parsed.body);
}
export { cmdRepeat };
