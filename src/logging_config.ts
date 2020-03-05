import {
  Category,
  CategoryServiceFactory,
  CategoryConfiguration,
  LogLevel
} from "typescript-logging";
import { ParsedMessage } from "discord-command-parser";

// Sets default logging to INFO
CategoryServiceFactory.setDefaultConfiguration(
  new CategoryConfiguration(LogLevel.Info)
);

export const logBot = new Category("gnome");

export function invalidCommand(parsed: ParsedMessage) {
  logBot.info(`An invalid command, "${parsed.command}" was sent and rejected`);
}
