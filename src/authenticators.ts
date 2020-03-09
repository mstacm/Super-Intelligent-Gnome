import { GuildMember } from "discord.js";

class AuthenticationError extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Takes a GuildMember and the requested access level, and checks to make sure
// they are allowed to access that level.
// Can check officer or user right now, can break up officer into exec board and chairs.
function isAuthenticated(user: GuildMember, requestedAccess: string) {
  let AUTHENTICATED = false;
  if (
    requestedAccess === "officer" &&
    user.roles.find(role => role.name === "Officers") &&
    user.guild.name === "ACM General"
  ) {
    AUTHENTICATED = true;
  } else if (requestedAccess === "user") AUTHENTICATED = true;
  else
    throw new AuthenticationError(
      `User: ${user.user.username} is not authorized to use this command.`
    );

  return AUTHENTICATED;
}

export { isAuthenticated, AuthenticationError };
