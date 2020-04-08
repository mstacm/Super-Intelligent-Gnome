import { Client, VoiceConnection } from "discord.js";
import { ParsedMessage } from "discord-command-parser";
import * as fs from "fs";
import { logBot } from "../logging_config";
import { isAuthenticated } from "../authenticators";
import { validateKMNR } from "../validators";

// Yell at everyone on every server. This will definitely make friends.

async function cmdKMNR(parsed: ParsedMessage, client: Client) {
  logBot.debug("Attempting to join voice channel");
  // Check if user is in a voice channel, else throw error
  validateKMNR(parsed);
  let voiceConn: VoiceConnection;

  if (parsed.arguments[0] === "start") {
    // Join the voice channel
    voiceConn = await parsed.message.member.voice.channel.join();
    // Start playing them sick beats
    // When you create a broadcast, it is added to an array here
    // client.voice.createBroadcast()
    // We add it to a var so we can manipulate it
    const kmnrBroadcast = client.voice.createBroadcast();

    kmnrBroadcast.play("https://boombox.kmnr.org/webstream.mp3");
    voiceConn.play(kmnrBroadcast);
  } else if (parsed.arguments[0] === "stop") {
    parsed.message.member.voice.channel.leave();
  }

  // Join the user's voice channel

  // Play stream in said voice channel

  // sendCheckup(parsed.message, SERVERS, toSend, title, client);
}

export { cmdKMNR };
