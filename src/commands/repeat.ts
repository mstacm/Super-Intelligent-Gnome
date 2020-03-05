import { ParsedMessage } from "discord-command-parser";
import { logBot, invalidCommand } from "../logging_config";
import { ValidationError, validateRepeat } from "../validators";

// Repeats the message back to you.

function cmdRepeat(parsed: ParsedMessage) {
  try {
    validateRepeat(parsed);
    parsed.message.channel.send(parsed.body);
  } catch (err) {
    if (err instanceof ValidationError) {
      parsed.message.reply(err.message);
      invalidCommand(parsed);
    }
  }
}
export { cmdRepeat };
