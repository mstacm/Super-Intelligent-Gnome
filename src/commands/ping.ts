import { Message } from "discord.js";

function cmdPing(message: Message) {
  message.channel.send("pong");
}

export { cmdPing };
