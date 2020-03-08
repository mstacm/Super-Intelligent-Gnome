import { Message, RichEmbed } from "discord.js";
import { logBot } from "../logging_config";

const helpMessage: RichEmbed = new RichEmbed()
  .setColor("#4AC55E")
  .setTitle("Help Message")
  .setAuthor("Gnome")
  .setDescription(
    "I am here to help unite the communities and let them know of events going on around ACM!"
  )
  .addField("?help", "Display a list of commands.")
  .addField("?remind", "Use to create reminders for yourself or others.")
  .addField(
    "Example usage",
    "?remind $Title$ |Location| 12/24/2020 08:42-12/25/2020 13:45",
    true
  )
  .addField(
    "?remind -p n |SEC|GEN|",
    "Send reminder n to the Security and General servers.",
    true
  )
  .addField(
    "?scream",
    "Spread your word across every Discord. Put your title on the first line, and put the message on the line below."
  )
  .addField("Example usage", "?scream Title of Event\\nMessage body", true)
  .addField("?repeat", "I repeat what you say back to you.")
  .addField("Example usage:", "?repeat Does this 👌 emoji work?")
  .setTimestamp()
  .setFooter("If you have any questions, talk to Gavin Lewis.");

function cmdHelp(message: Message) {
  logBot.debug("Help command received.");
  message.channel.send(helpMessage);
}

export { cmdHelp };
