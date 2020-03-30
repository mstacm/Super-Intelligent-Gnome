import {
  Client,
  Guild,
  Message,
  TextChannel,
  MessageEmbed,
  MessageReaction,
  User,
  GuildChannel
} from "discord.js";
import { logBot } from "./logging_config";

const serverInfo = require("./server_info.json");

/*  Will send the contents of an approved embed to the intended destination
 */
export async function sendToChannel(
  targets: string | TextChannel,
  message: string | MessageEmbed,
  client: Client
): Promise<Message[]> {
  // targets: A string that looks like |sec|web|
  // message: The exact string you want sent
  const messages: Message[] = [];

  if (targets instanceof TextChannel) {
    const chan: TextChannel = targets as TextChannel;
    const msg: Message | Message[] = await chan.send(message);
    if (msg instanceof Message) messages.push(msg);
    else messages.concat(msg);
    return messages;
  }

  let filteredTargets: string[] = [];

  if (targets.indexOf("EVERYONE") === -1) {
    const targetDiscords: string[] = targets
      .toLocaleUpperCase()
      .split("|")
      .map(item => item.trim());

    await targetDiscords.filter((item: string, index: number) => {
      if (targetDiscords.indexOf(item) === index) filteredTargets.push(item);
    });
  } else {
    // Add all communities to the targets if everyone was there or no one was
    filteredTargets = [
      "GEN",
      "SEC",
      "WEB",
      "GAME",
      "COMP",
      "W",
      "HACK",
      "DATA",
      "CDT",
      "CS"
    ];
  }

  logBot.debug("Beginning to send.");
  for (const community of filteredTargets) {
    if (community) {
      try {
        const guild: Guild = client.guilds.cache.find(
          (guildCheck: Guild) => guildCheck.name === serverInfo[community].guild
        );
        if (guild) {
          const channel: TextChannel = guild.channels.cache.find(
            (chan: GuildChannel) => chan.name === serverInfo[community].channel
          ) as TextChannel;
          if (channel) {
            logBot.debug(() => `Sending to ${community}`);

            const msg: Message | Message[] = await channel.send(message);
            if (msg instanceof Message) {
              messages.push(msg);
            } else {
              messages.concat(msg);
            }
          } else {
            logBot.error(
              () => `Channel: ${serverInfo[community].channel} not found`,
              new Error()
            );
          }
        } else {
          logBot.error(
            `Guild: ${serverInfo[community].guild} not found`,
            new Error()
          );
        }
      } catch (err) {
        logBot.error("Error sending the message.", err);
      }
    }
  }
  return messages;
}

/* Build an embed from the given information, intended to use as a check
 *  before sending a message.
 */
function buildTestEmbed(
  msg: string,
  title: string,
  dest: string,
  discordMessage: Message
) {
  logBot.debug("Building test embed.");
  const msgEmbed: MessageEmbed = new MessageEmbed()
    .setColor("#4AC55E")
    .setTitle("ACM Announcement - DOUBLE CHECK")
    .setAuthor("Super Intelligent Gnome")
    .setThumbnail("https://cdn.mstacm.org/static/acm.png")
    .addField("[at_everyone][announcement]", msg)
    .addField("Destination:", dest)
    .addField(
      "What will be removed:",
      "'- DOUBLE CHECK'\nThe Destination Field\n[at_everyone] will become @"
    )
    .addField(
      "Controls",
      "You need at least 3 👌 to send the message, besides the creator, otherwise it will timeout and will not be sent. You can react with 🚫 to cancel early."
    )
    .setTimestamp()
    .setFooter(
      "If you have any questions, talk to Gavin Lewis.",
      "https://cdn.mstacm.org/static/acm.png"
    );

  if (discordMessage.attachments.size > 0) {
    msgEmbed.setImage(discordMessage.attachments.first().url);
  }
  return msgEmbed;
}

// Generate an embed from the msg and send it
async function sendEmbed(
  msg: string,
  title: string,
  dest: string,
  client: Client,
  discordMessage: Message
) {
  logBot.debug("Creating actual embed for message.");

  const msgEmbed: MessageEmbed = new MessageEmbed()
    .setColor("#4AC55E")
    .setTitle(title)
    .setAuthor("ACM Announcement")
    .setThumbnail("https://cdn.mstacm.org/static/acm.png")

    .addField("[@everyone][announcement]", msg);

  if (discordMessage.attachments.size > 0) {
    msgEmbed.attachFiles([discordMessage.attachments.first().url]);
  }
  logBot.debug("Message embed successfully created.");
  sendToChannel(dest, msgEmbed, client);
}

/* Sends a quick and dirty double check message, need a check in the main loop to see
 *  if the embed gets the proper react to send
 */
export async function sendCheckup(
  discordMessage: Message,
  targets: string,
  toSend: string,
  title: string,
  client: Client
) {
  // Embeds can only be so long
  if (toSend.length >= 1024) {
    logBot.debug("Message was over 1024 characters.");
    discordMessage.channel.send("Message must be less than 1024 characters.");
    return;
  }
  if (title.length >= 256) {
    logBot.debug("Title was over 256 characters.");
    discordMessage.channel.send("Title must be less than 256 characters.");
    return;
  }
  // Should only ever be a Message, not a Message array because we only send one message
  const checkupMsg: Message | Message[] = await discordMessage.channel.send(
    buildTestEmbed(toSend, title, targets, discordMessage)
  );

  const NUM_TO_APPROVE = 2;
  const NUM_TO_DISAPPROVE = 1;
  const YUP_EMOJI = "👌";
  const NOPE_EMOJI = "🚫";

  const filter = (reaction: MessageReaction, user: User) => {
    // Only other users can approve, but the creator can deny
    return (
      (reaction.emoji.name === YUP_EMOJI &&
        user.id !== discordMessage.author.id) ||
      reaction.emoji.name === NOPE_EMOJI
    );
  };

  if (checkupMsg instanceof Message) {
    // If we have a single message
    await checkupMsg.react(YUP_EMOJI).then(() => checkupMsg.react(NOPE_EMOJI));
  } else {
    await checkupMsg[0]
      .react(YUP_EMOJI)
      .then(() => checkupMsg[0].react(NOPE_EMOJI));
  }

  if (checkupMsg instanceof Message) {
    const collector = checkupMsg.createReactionCollector(filter, {
      time: 150000
    });

    collector.on("collect", (reaction, reactionCollector) => {
      if (reactionCollector.collected.get(NOPE_EMOJI)) {
        // If we collected a Nope
        const badCount: number = reactionCollector.collected.get(NOPE_EMOJI)
          .count;
        if (badCount >= 2) {
          // Someone said no
          collector.stop();
        }
      }
      if (reactionCollector.collected.get(YUP_EMOJI)) {
        // If we collected a yup
        const goodCount: number = reactionCollector.collected.get(YUP_EMOJI)
          .count;
        if (goodCount >= NUM_TO_APPROVE + 1) {
          // We are ready to send
          checkupMsg.channel.send("Enough people have confirmed, sending...");
          sendToChannel(targets, "@everyone", client);
          sendEmbed(toSend, title, targets, client, discordMessage);
          collector.stop(); // Keeps from multi sending, calls on(end()...
        } else {
          checkupMsg.channel.send(
            `Need ${(NUM_TO_APPROVE - goodCount + 1).toString()} more to send`
          );
        }
      }
    });

    collector.on("end", collected => {
      if (collected.get(NOPE_EMOJI)) {
        // Collected a nope
        if (collected.get(NOPE_EMOJI).count >= NUM_TO_DISAPPROVE + 1) {
          checkupMsg.channel.send("Someone said no, cancelling sending.");
        }
      } else if (collected.get(YUP_EMOJI)) {
        // We collected a yup
        if (collected.get(YUP_EMOJI).count < NUM_TO_APPROVE + 1) {
          checkupMsg.channel.send(
            "There was not enough feedback, get more reactions."
          );
        }
      }
    });
  } else {
    checkupMsg[0].awaitReactions(filter);
  }
}
