import { Client, Message } from "discord.js";
import { send_checkup } from "../send";

// Repeats the message back to you.

function cmd_repeat(message: Message, client: Client) {
    const index: number = message.content.indexOf("\n");
    const title: string = message.content.substring(8, index);
    const toSend: string = message.content.substring(index+1);

    console.log(toSend);
    if (toSend.length >= 1) {
        send_checkup(message, "HERE", toSend, title, client);
    }
}

export { cmd_repeat };