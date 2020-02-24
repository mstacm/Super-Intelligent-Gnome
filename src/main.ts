import Discord from "discord.js";
// npm run dev

// Import commands from the commands/ folder
import { cmdPing } from "./commands/ping";
import { cmdHelp } from "./commands/help";
import { cmdRemind } from "./commands/remind";
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

const config: CONFIG = require("./config.json");

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    game: {
      name: "with Typescript"
    },
    status: "online"
  });

  // Example for sending messages at a set time.
  // let interval = setInterval(function() { console.log("Hello"); }, 150);
  // const guilds = client.guilds;

  // Send test announcement to the CDT Discord
  // send_to_channel("CDT", "This is a test");
});

client.on("message", msg => {
  // ignore bots and self, and messages that dont start with prefix
  if (msg.author.bot) return;

  const args: string[] = msg.content.split(" ", 4);
  const cmdSwitch: string = args[0].charAt(0);

  console.log(args);

  // Keep for testing
  if (msg.content === "ping") {
    cmdPing(msg);
  }

  if (
    cmdSwitch === "?" &&
    msg.member.roles.find(role => role.name === "Officers") &&
    msg.member.guild.name === "ACM General"
  ) {
    if (msg.content === "?tada") {
      msg.channel.send("Its not party time. ");
    }

    if (cmdSwitch === "?") {
      if (args[0] === "?help") {
        cmdHelp(msg);
      } else if (args[0] === "?remind") {
        cmdRemind(msg, args, client);
      } else if (args[0] === "?scream") {
        cmdScream(msg, client);
      } else if (args[0] === "?repeat") {
        cmdRepeat(msg, client);
      } else {
        msg.channel.send(`Unkown command: ${args[0]}`);
      }
    }
  }
});

client.login(config.token);
