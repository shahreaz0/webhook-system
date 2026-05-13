import type { Message } from "@webhook/database";

export interface MessageJobData {
  message: Message & { eventName: string };
  session: { id: string; name: string };
}
