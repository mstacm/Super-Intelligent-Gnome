import Discord, { Message } from "discord.js";
import parser, { ParsedMessage } from "discord-command-parser";
import { AuthenticationError } from "./authenticators";
import { logBot } from "./logging_config";
import { ValidationError } from "./validators";

// Import commands from the commands/ folder
import { cmdPing } from "./commands/ping";
import { cmdPoll } from "./commands/poll";
import { cmdHelp } from "./commands/help";
import { cmdScream } from "./commands/scream";
import { cmdRepeat } from "./commands/repeat";

// Info on changing user's nick names
// https://stackoverflow.com/questions/41247353/change-user-nickname-with-discord-js
// setInterval() might be able to be used to delay a timed message
// Could also just add a command only officers could use to push the events

// Info on seperating out the commands, kind of works but feels a bit wonk
// Maybe just because im tired
// https://discordjs.guide/command-handling/adding-features.html#a-dynamic-help-command

interface CONFIG {
  prefix: string;
  token: string;
}
const prefix = "?";

const config: CONFIG = require("./config.json");

const client = new Discord.Client();

function invalidCommand(parsed: ParsedMessage) {
  logBot.info(
    `An invalid command from ${parsed.message.author.username}, "${parsed.command}" was sent and rejected`
  );
}

function unauthenticatedCommand(parsed: ParsedMessage) {
  logBot.info(
    `User: "${parsed.message.author.username}" just tried to use command: "${parsed.command}".`
  );
}
client.on("ready", () => {
  logBot.info(() => `Logged in as ${client.user.tag}`);

  client.user.setPresence({
    game: {
      name: "with Typescript"
    },
    status: "online"
  });
});

client.on("message", async (message: Message) => {
  // ignore bots and self, and messages that dont start with prefix
  const parsed = parser.parse(message, prefix, {
    allowBots: false,
    allowSelf: false
  });
  // If parsing failed, back out
  if (!parsed.success) return;

  // Coommands only to be run by officers
  if (message.content === "ping") {
    logBot.debug("Ping command received.");
    cmdPing(message);
  }

  try {
    if (parsed.command === "repeat") {
      cmdRepeat(parsed);
    } else if (parsed.command === "scream") {
      cmdScream(parsed, client);
    } else if (parsed.command === "help") {
      cmdHelp(message);
    } else if (parsed.command === "poll") {
      await cmdPoll(parsed, client);
    } else {
      message.reply(`${parsed.command} is not a command you can use`);
      invalidCommand(parsed);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      parsed.message.reply(err.message);
      invalidCommand(parsed);
    } else if (err instanceof AuthenticationError) {
      unauthenticatedCommand(parsed);
    } else {
      console.log(err);
    }
  }
});

client.login(config.token);
