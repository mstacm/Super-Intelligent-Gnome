import { Message, MessageEmbed } from "discord.js";
import { logBot } from "../logging_config";

const helpMessage: MessageEmbed = new MessageEmbed()
  .setColor("#4AC55E")
  .setTitle("Help Message")
  .setAuthor("Gnome")
  .setDescription(
    "I am here to help unite the communities and let them know of events going on around ACM!"
  )
  .addField("?help", "Display a list of commands.")
  .addField("?poll", "Create polls for users to respond to.")
  .addField(
    "Example:",
    '?poll here "whats up doc" :muscle: "not much" :smiling_imp: "too much"',
    true
  )
  .addField(
    "?scream",
    "Spread your word across every Discord. Put your title on the first line, and put the message on the line below."
  )
  .addField("Example:", "?scream Title of Event\\nMessage body", true)
  .addField("?repeat", "I repeat what you say back to you.")
  .addField("Example usage:", "?repeat Does this 👌 emoji work?")
  .setTimestamp()
  .setFooter("If you have any questions, talk to Gavin Lewis.");

async function cmdHelp(message: Message) {
  logBot.debug("Help command received.");
  message.reply(helpMessage);
}

export { cmdHelp };
