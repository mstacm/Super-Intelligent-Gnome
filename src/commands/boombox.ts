import { Client, VoiceConnection, VoiceBroadcast, Channel } from "discord.js";
import { ParsedMessage } from "discord-command-parser";
import { google, sql_v1beta4 } from "googleapis";
import { CodeVerifierResults } from "google-auth-library";
import { Database } from "sqlite3";
import { logBot } from "../logging_config";
import { validateKMNR } from "../validators";
import { addToQueue, listQueue, clearQueue } from "../db_manager";

// Used for all boombox commands. Will take a search term, grab the first
// match from Youtube, add the song to the queue, and play the song

const YOUTUBE_BASE: string = "https://www.youtube.com/watch?v=";
const ytCLIENT = google.youtube("v3");

interface songObj {
  // eslint-disable-next-line camelcase
  q_num: number;
  title: string;
}

async function cmdBoombox(
  parsed: ParsedMessage,
  client: Client,
  ytToken: string
) {
  logBot.debug("Running boombox command.");
  // List object that contains the link to the video and the title
  // We make it a list so we can go back and forth and not lose songs
  // in a session
  // [url, title][]
  // let queue: [string, string][];
  const curr_song: number = 0;
  let voiceConn: VoiceConnection;
  const SERVER_NAME: string = parsed.message.member.guild.name;

  if (parsed.arguments[0] === "play") {
    // Must have a search term passed with it
    // Connect to a voice channel
    // voiceConn = await parsed.message.member.voice.channel.join();
    // Slam arguments 1+ together
    // Search for term
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
              // queue.push([results[i].id.videoId, results[i].snippet.title]);
              break;
            }
          }
        }
      }
    );

    // Parse data and add to queue
    // Play song in voice channel
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
