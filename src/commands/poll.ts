import { Client, RichEmbed, Message } from "discord.js";
import { sendToChannel } from "../send";

// Yell at everyone on every server. This will definitely make friends.

const SERVERS: string = "EVERYONE";

function getOptionsString(options: any) {
  let out: string = "";
  for (let option in options) {
    out += `${option} ${options[option]}\n\n`;
  }
  return out;
}

async function cmdPoll(message: Message, args: string[], client: Client) {
  // ?poll target "Question" emoji1 "response meaning" emoji2 "xxxxx"...
  const options: any = {};
  for (let i = 2; i < args.length; i += 2) {
    options[args[i]] = args[i + 1];
  }

  const target = args[0];

  const pollEmbed = new RichEmbed()
    .setColor("#4AC55E")
    .setTitle(args[1])
    .setAuthor("Poll")
    .addField("Options", getOptionsString(options))
    .setTimestamp()
    .setFooter("If you have any questions, talk to Gavin Lewis.");
  const polls: Message[] = await sendToChannel(target, pollEmbed, client);
  for (let poll of polls)
    for (const option in options) await poll.react(option);
  return true;
}

export { cmdPoll };
