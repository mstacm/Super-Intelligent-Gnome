import Discord, { Message } from "discord.js";
import parser from "discord-command-parser";
import { logBot } from "./logging_config";

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

client.on("ready", () => {
  logBot.info(() => `Logged in as ${client.user.tag}`);

  client.user.setPresence({
    game: {
      name: "with Typescript"
    },
    status: "online"
  });

  // Example for sending messages at a set time.
  // let interval = setInterval(function() { console.log("Hello"); }, 150);
  // const guilds = client.guilds;
});

client.on("message", (message: Message) => {
  // ignore bots and self, and messages that dont start with prefix
  const parsed = parser.parse(message, prefix, {
    allowBots: false,
    allowSelf: false
  });
  // If parsing failed, back out
  if (!parsed.success) return;

  if (
    message.member.roles.find(role => role.name === "Officers") &&
    message.member.guild.name === "ACM General"
  ) {
    // Keep for testing
    if (message.content === "ping") {
      cmdPing(message);
    }

    if (parsed.command === "help") {
      cmdHelp(message);
    } else if (parsed.command === "tada") {
      message.channel.send("Its not party time. ");
    } else if (parsed.command === "poll") {
      cmdPoll(message, parsed.arguments, client);
    } else if (parsed.command === "repeat") {
      cmdRepeat(message, client);
    } else if (parsed.command === "scream") {
      cmdScream(message, client);
    } else {
      message.channel.send(`Unknown command: ${parsed.command}`);
    }
  }
});

client.login(config.token);
