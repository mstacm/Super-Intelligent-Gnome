import { Client, VoiceConnection, VoiceBroadcast, Channel } from "discord.js";
import { ParsedMessage } from "discord-command-parser";
import { google } from "googleapis";
import { resolveCname } from "dns";
import ytdl from "ytdl-core";
import { logBot } from "../logging_config";
import { validateBoombox } from "../validators";
import {
  addToQueue,
  listQueue,
  clearQueue,
  playingSource,
  getCurrSongIndex,
  getSongInfo,
  updateCurrSong
} from "../db_manager";

// Used for all boombox commands. Will take a search term, grab the first
// match from Youtube, add the song to the queue, and play the song

// Call when we need to join a voice chat
// Handles if the gnome is already in the VC already
async function joinVC(parsed: ParsedMessage): Promise<VoiceConnection> {
  return new Promise<VoiceConnection>(resolve => {
    const targetChannel = parsed.message.member.voice.channel;
    let voiceConn: VoiceConnection = parsed.message.client.voice.connections.find(
      (vc: VoiceConnection) =>
        vc.channel.id === parsed.message.member.voice.channel.id
    );

    // Skip if we already have a connection
    if (!voiceConn) {
      if (targetChannel.joinable && targetChannel.speakable) {
        voiceConn = targetChannel.join();
      } else {
        throw new Error();
      }
    }
    resolve(voiceConn);
  });
}

// CONSTANT DECLARATIONS
const YOUTUBE_BASE: string = "https://www.youtube.com/watch?v=";
const ytCLIENT = google.youtube("v3");

interface songObj {
  // eslint-disable-next-line camelcase
  q_num: number;
  title: string;
}

// Main function
async function cmdBoombox(
  parsed: ParsedMessage,
  client: Client,
  ytToken: string
) {
  logBot.debug("Running boombox command.");
  validateBoombox(parsed);

  let voiceConn: VoiceConnection;
  const SERVER_NAME: string = parsed.message.member.guild.name;

  if (parsed.arguments[0] === "play") {
    // Must have a search term passed with it

    // Connect to a voice channel
    voiceConn = await joinVC(parsed);

    // Search for term and add it to the queue
    ytCLIENT.search.list(
      {
        part: "snippet",
        maxResults: 5,
        q: parsed.arguments.slice(1).join(" "),
        key: ytToken
      },
      (err: any, response: any) => {
        if (err) {
          logBot.warn("Error with making YouTube search.");
          return;
        }
        const results = response.data.items;
        if (results.length === 0) {
          logBot.info("Nothing returned in YouTube response.");
        } else {
          for (let i: number = 0; i < results.length; i++) {
            if (results[i].id.kind === "youtube#video") {
              // We got a video result, add it
              addToQueue(
                SERVER_NAME,
                results[i].snippet.title,
                results[i].id.videoId
              );
              break;
            }
          }
        }
      }
    );

    // Check to see if we need to start playing or naw
    // There should be at least one song in the queue
    const source = playingSource(SERVER_NAME);
    if (source === "none") {
      // We need to start playing at the current song
      // Stores the current spot in the queue
      const currSong = getCurrSongIndex(SERVER_NAME);
      // if (currSong === -1) {
      //   const songData = getSongInfo(SERVER_NAME, 0);
      //   updateCurrSong(SERVER_NAME, 0);
      // } else {

      // }
      const songData = getSongInfo(SERVER_NAME, currSong + 1);
      console.log(songData);
      updateCurrSong(SERVER_NAME, currSong + 1);
      // eslint-disable-next-line dot-notation
      const dispatcher = voiceConn.play(ytdl(YOUTUBE_BASE + songData["url"]));
      dispatcher.on("end", () => {
        console.log("Play next song, if there is one");
      });
    } else if (source === "youtube") {
      console.log(
        "Youtube was the last source, so we should already be playing"
      );
    } else if (source === "kmnr") {
      console.log("KMNR was the last source");
    }
  } else if (parsed.arguments[0] === "stop") {
    // Stop the song currently playing
  } else if (parsed.arguments[0] === "skip") {
    // Skip the current song
  } else if (parsed.arguments[0] === "queue") {
    // List the Queue
    const queue: songObj[] = listQueue(SERVER_NAME);
    console.log("INT", queue);
  } else if (parsed.arguments[0] === "clear") {
    clearQueue(SERVER_NAME);
  }
}

export { cmdBoombox };
