import type { Message } from "@xwebhook/database";

export interface MessageJobData {
  message: Message & { eventName: string };
  session: { id: string; name: string };
}
