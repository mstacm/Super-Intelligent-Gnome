import { Message } from "discord.js";

function cmdTada(message: Message) {
  message.channel.send("This is no time for games.");
}

export { cmdTada };
