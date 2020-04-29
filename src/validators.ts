import { VoiceConnection } from "discord.js";
import { ParsedMessage, parse } from "discord-command-parser";

class ValidationError extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateTarget(targetString: string): boolean {
  const targets: string[] = targetString.split("|");
  const serverInfo = require("./server_info.json");
  let found: boolean;
  for (const target of targets) {
    found = false;
    for (const community in serverInfo) {
      if (target === community) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

function validateRepeat(parsed: ParsedMessage) {
  // Need something to repeat, cant be empty
  if (parsed.arguments.length === 0)
    throw new ValidationError("Nothing was sent");
}

function validatePoll(parsed: ParsedMessage) {
  if (parsed.arguments.length === 0)
    throw new ValidationError("No arguments specified");
  // Validate target
  // should either be here or Community target string
  if (parsed.arguments[0] !== "here" && !validateTarget(parsed.arguments[0]))
    throw new ValidationError(
      `Invalid Discord target "${parsed.arguments[0]}" in command "${parsed.command}"`
    );

  if (parsed.arguments.length === 1)
    throw new ValidationError("No poll question specified");
  if (parsed.arguments.length === 2)
    throw new ValidationError("Must specify at least one response");

  const responses: string[] = parsed.arguments.slice(2);

  if (responses.length % 2 !== 0)
    // check that starting at index 2, there are an even number of elements
    throw new ValidationError(
      "There must be an equal number of reactions and descriptions"
    );
}

function validateScream(parsed: ParsedMessage) {
  // some string less than 256 length (title) then newline
  // everything after needs to be less than 1024 length
  if (parsed.body.length === 0)
    throw new ValidationError("Message is required for scream");
  const index: number = parsed.body.indexOf("\n");
  const title: string = parsed.body.substring(0, index);
  const toSend: string = parsed.body.substring(index + 1);
  if (index === -1)
    throw new ValidationError("No newline detected, please fix formatting");
  if (title.length >= 256)
    throw new ValidationError("Embed title must be less than 256 characters");
  if (toSend.length >= 1024)
    throw new ValidationError(
      "Embed content must be less than 1024 characters"
    );
}

function validateKMNR(parsed: ParsedMessage) {
  if (parsed.arguments.length === 0)
    throw new ValidationError("KMNR needs start or stop argument");
  if (parsed.arguments.length > 1)
    throw new ValidationError("Too many arguments for KMNR command");
  // Author must be in a voice channel AND in the same guild
  if (
    !(
      parsed.message.member.voice.channel &&
      parsed.message.member.guild === parsed.message.member.voice.guild
    )
  )
    throw new ValidationError(
      "Author was not in the correct state to call this command"
    );
  if (!parsed.message.member.voice.channel.joinable)
    throw new ValidationError("For some reason I cannot join you");
  if (!parsed.message.member.voice.channel.speakable)
    throw new ValidationError("I am unable to speak in this voice channel");
  // Fail if author wants a start and bot is already in that voice channel
  if (
    parsed.message.client.voice.connections.find(
      (vc: VoiceConnection) =>
        vc.channel.id === parsed.message.member.voice.channel.id
    ) &&
    parsed.arguments[0] === "start"
  ) {
    throw new ValidationError("We are already partying, friend");
  }
  // Fail if author wants to stop the bot when it is not in there
  if (
    !parsed.message.client.voice.connections.find(
      (vc: VoiceConnection) =>
        vc.channel.id === parsed.message.member.voice.channel.id
    ) &&
    parsed.arguments[0] === "stop"
  )
    throw new ValidationError("I am not in there anyway");
}

function validateBoombox(parsed: ParsedMessage) {
  if (parsed.arguments.length === 0)
    throw new ValidationError(
      "Boombox needs at least one more argument. (play, stop, queue)"
    );
  // Author must be in a voice channel AND in the same guild
  if (
    !(
      parsed.message.member.voice.channel &&
      parsed.message.member.guild === parsed.message.member.voice.guild
    )
  )
    throw new ValidationError(
      "Author was not in the correct state to call this command"
    );
}

export {
  validatePoll,
  validateRepeat,
  validateScream,
  validateKMNR,
  validateBoombox,
  ValidationError
};
