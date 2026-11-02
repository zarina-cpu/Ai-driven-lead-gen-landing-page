import { buildLocalChatReply } from "./localChat.js";

/** @deprecated используйте buildLocalChatReply */
export function mockLeadBot({ message, lead }) {
  return buildLocalChatReply({ message, lead });
}
