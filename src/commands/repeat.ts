import { Client, Message } from "discord.js";
import { send_to_channel, send_checkup } from "../send";

// Repeats the message back to you.

function cmd_repeat(message: Message, client: Client) {
    var toSend: string = message.content.substring(8);
    console.log(toSend);
    if (toSend.length >= 1) {
        send_checkup(message, "HERE", toSend, client);
    }
}

export { cmd_repeat };