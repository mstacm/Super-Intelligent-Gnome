import { GuildMember, Role } from "discord.js";
import { ParsedMessage } from "discord-command-parser";

class AuthenticationError extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Takes a GuildMember  from a parsed message and the requested access level, and checks to make sure
// they are allowed to access that level.
// Can check officer or user right now, can break up officer into exec board and chairs.
function isAuthenticated(parsed: ParsedMessage, requestedAccess: string) {
  let AUTHENTICATED = false;
  if (
    requestedAccess === "officer" &&
    parsed.message.member.roles.cache.find(
      (role: Role) => role.name === "Officers"
    ) &&
    parsed.message.member.guild.name === "ACM General"
  ) {
    AUTHENTICATED = true;
  } else if (requestedAccess === "user") AUTHENTICATED = true;
  else
    throw new AuthenticationError(
      `User: ${parsed.message.member.user.username} is not authorized to use this command.`
    );

  return AUTHENTICATED;
}

export { isAuthenticated, AuthenticationError };
