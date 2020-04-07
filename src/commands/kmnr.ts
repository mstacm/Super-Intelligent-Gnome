import { Client } from "discord.js";
import { ParsedMessage } from "discord-command-parser";
import { logBot } from "../logging_config";
import { isAuthenticated } from "../authenticators";
import { validateKMNR } from "../validators";

// Yell at everyone on every server. This will definitely make friends.

function cmdKMNR(parsed: ParsedMessage, client: Client) {
  logBot.debug("Attempting to join voice channel");
  // Check if user is in a voice channel, else throw error
  validateKMNR(parsed);

  console.log("Auth");
  if (parsed.arguments[0] === "start") {
    parsed.message.member.voice.channel.join();
  } else if (parsed.arguments[0] === "stop") {
    console.log("leaving");
    parsed.message.member.voice.channel.leave();
  }

  // Join the user's voice channel

  // Play stream in said voice channel

  // sendCheckup(parsed.message, SERVERS, toSend, title, client);
}

export { cmdKMNR };
