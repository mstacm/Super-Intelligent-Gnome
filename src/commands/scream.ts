import { Client, Message } from "discord.js";
import { send_checkup } from "../send";

// Yell at everyone on every server. This will definitely make friends.

const SERVERS: string = "EVERYONE"; 

function cmd_scream(message: Message, client: Client) {
    const index: number = message.content.indexOf("\n");
    const title: string = message.content.substring(8, index);
    const toSend: string = message.content.substring(index+1);

    if (toSend.length && title.length) {
        send_checkup(message, SERVERS, toSend, title, client);
    }
}

export { cmd_scream };