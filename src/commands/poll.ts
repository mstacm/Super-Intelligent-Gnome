import { TextChannel, Client, RichEmbed, Message } from "discord.js";
import { ParsedMessage } from "discord-command-parser";
import { sendToChannel } from "../send";
import { ValidationError, validatePoll } from "../validators";
import { logBot, invalidCommand } from "../logging_config";

function getOptionsString(options: any) {
  let out: string = "";
  for (const option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      out += `${option} ${options[option]}\n\n`;
    }
  }
  return out;
}

async function cmdPoll(parsed: ParsedMessage, client: Client) {
  // ?poll target "Question" emoji1 "response meaning" emoji2 "xxxxx"...
  try {
    validatePoll(parsed);
    const args = parsed.arguments;
    const target = parsed.arguments[0];

    const options: any = {};
    for (let i = 2; i < args.length; i += 2) {
      try {
        await parsed.message.react(args[i]);
      } catch (err) {
        throw new ValidationError(`${args[i]} is not a valid emoji`);
      }
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
      polls = [(await parsed.message.channel.send(pollEmbed)) as Message];
    else polls = await sendToChannel(target, pollEmbed, client);
    for (const p of polls) {
      for (const option in options) {
        if (Object.prototype.hasOwnProperty.call(options, option)) {
          p.react(option);
        }
      }
    }
    await parsed.message.clearReactions();
  } catch (err) {
    if (err instanceof ValidationError) {
      parsed.message.reply(err.message);
      invalidCommand(parsed);
    }
  }
}

export { cmdPoll };
