import { Client, Guild, Message, TextChannel, RichEmbed, ReactionEmoji, MessageReaction, User } from "discord.js";
import { stringify } from "querystring";
let server_info = require("../server_info.json");

/* Build an embed from the given information, intended to use as a check
*  before sending a message.
*/
function build_test_embed(msg: string, dest: string) {
  return new RichEmbed()
    .setColor("#4AC55E")
    .attachFile("./resources/acm-logo-thicc.png")
    .setTitle("ACM Anouncement - DOUBLE CHECK")
    .setAuthor("Super Intelligent Gnome")
    .setThumbnail("attachment://acm-logo-thicc.png")
    
    .addField("[at_everyone][anouncement]", msg)
    .addField("Destination:", dest)
    .addField("What will be removed:", "'- DOUBLE CHECK'\nThe Destination Field\n[at_everyone] will become @")
    .addField("Controls", "You need at least 2 👌 to send the message, otherwise it will timeout and will not be sent.")
    .setTimestamp()
    .setFooter("If you have any questions, talk to Gavin Lewis.", "attachment://acm-logo-thicc.png");
}

// Generate an embed from the msg and send it
async function send_embed(msg: string, dest: string, client: Client) {
  let msg_embed: RichEmbed = new RichEmbed()
    .setColor("#4AC55E")
    .attachFile("./resources/acm-logo-thicc.png")
    .setTitle("ACM Anouncement")
    .setAuthor("Super Intelligent Gnome")
    .setThumbnail("attachment://acm-logo-thicc.png")

    .addField("[@everyone][anouncment]", msg);

  send_to_channel(dest, msg_embed, client);
}

/* Sends a quick and dirty double check message, need a check in the main loop to see
*  if the embed gets the proper react to send
*/
export async function send_checkup(discord_message: Message, targets: string, message: string, client: Client)  { 
  // Should only ever be a Message, not a Message array because we only send one message
  const checkupMsg: Message | Message[] = await discord_message.channel.send(build_test_embed(message, targets));
  
  if (checkupMsg instanceof Message) {
    checkupMsg.react('👌'); 
  } else {
    checkupMsg[0].react('👌');
  }
    
  const numToApprove = 2;

  const filter = (reaction: MessageReaction, user: User) => {
    return reaction.emoji.name === '👌' && user.id !== discord_message.author.id;
  }
  
  if (checkupMsg instanceof Message) {
    const collector = checkupMsg.createReactionCollector(filter, {time:75000})

    collector.on('collect', (reaction, reactionCollector) => {
      const count: number = reactionCollector.collected.array()[0].count;
      if (count >= numToApprove+1) {
        checkupMsg.channel.send("Enough people have confirmed, sending...");
        send_embed(message, targets, client);
        collector.stop(); // Keeps from multi sending, calls on(end()...
      } else {
        checkupMsg.channel.send("Need " + (numToApprove - count + 1).toString() +" more to send");
      }
    });

    collector.on('end', (collected => {
      if (collected.array()[0].count < numToApprove+1) {
        checkupMsg.channel.send("There was not enough feedback, get more reactions.");
      }
    }));

  } else {
    checkupMsg[0].awaitReactions(filter);
  }
  
}

/*  Will send the contents of an approved embed to the intended destination
*/
export function send_to_channel(targets: string, message: string | RichEmbed, client: Client): void {
    // targets: A string that looks like |sec|web|
    // message: The exact string you want sent
  
    let filteredTargets: string[] = [];
  
    if (targets.indexOf("EVERYONE") === -1) {
      // If EVERYONE is not present, parse the targets
      let targetDiscords: string[] = targets.toLocaleUpperCase().split("|").map(item => item.trim());
    
      targetDiscords.filter((item: string, index: number) => {
      if (targetDiscords.indexOf(item) === index)
        filteredTargets.push(item);
      });
    } else {
      // Add all communities to the targets if everyone was there or no one was
      filteredTargets = ["GEN", "SEC", "WEB", "GAME", "COMP", "W", "HACK", "DATA"];
    }
    
    // TODO: Add a check back to the user in an embed to make sure all info is correct before sending
  
    console.log(filteredTargets);
  
    filteredTargets.forEach( function(community: string) {
      if (community) {
        try {
          let guild: Guild = client.guilds.find(guild => guild.name === server_info[community].guild);
          if (guild) {
            let channel: TextChannel = guild.channels.find(channel => channel.name === server_info[community].channel) as TextChannel;
            if (channel) {
              console.log("Simulate sending")
              //console.log(message);
              channel.send(message);
            } else {
              console.log("Channel: " + server_info[community].channel + " not found");
            }
          } else {
            console.log("Guild: " + server_info[community].guild + " not found");
          }
        }
        catch (err) {
          console.log("Error sending the message.");
        }
      }
    })
  };