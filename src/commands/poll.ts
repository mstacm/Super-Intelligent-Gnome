import { TextChannel, Client, RichEmbed, Message } from "discord.js";
import { sendToChannel } from "../send";

function getOptionsString(options: any) {
  let out: string = "";
  for (const option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      out += `${option} ${options[option]}\n\n`;
    }
  }
  return out;
}

async function cmdPoll(message: Message, args: string[], client: Client) {
  // ?poll target "Question" emoji1 "response meaning" emoji2 "xxxxx"...
  const target = args[0];

  const options: any = {};
  for (let i = 2; i < args.length; i += 2) {
    options[args[i]] = args[i + 1];
  }

  const pollEmbed = new RichEmbed()
    .setColor("#4AC55E")
    .setTitle(args[1])
    .setAuthor("Poll")
    .addField("Options", getOptionsString(options))
    .setTimestamp()
    .setFooter("If you have any questions, talk to Gavin Lewis.");

  let polls: Message[];
  if (target.toLowerCase() === "here")
    polls = [(await message.channel.send(pollEmbed)) as Message];
  else polls = await sendToChannel(target, pollEmbed, client);
  for (const p of polls) {
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        p.react(option);
      }
    }
  }
}

export { cmdPoll };
