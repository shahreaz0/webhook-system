export interface User {
  activeApplicationId: string | null;
  createdAt: string;
  email: string;
  id: string;
  name: string | null;
}

export interface Session {
  expiresAt: string;
  id: string;
  token: string;
  userId: string;
}

export interface Application {
  createdAt: string;
  description: string | null;
  id: string;
  name: string;
  userId: string;
}

export interface EventType {
  applicationId: string;
  archived: boolean;
  createdAt: string;
  deprecated: boolean;
  description: string | null;
  groupName: string | null;
  id: string;
  name: string;
}

export interface Subscriber {
  applicationId: string;
  createdAt: string;
  email: string;
  id: string;
  metadata: any | null;
  referenceId: string;
}

export interface Webhook {
  createdAt: string;
  description: string | null;
  disabled: boolean;
  eventTypes: string[];
  headers: Record<string, string>;
  id: string;
  labels: Record<string, string>;
  metadata: any | null;
  method: string;
  name: string;
  rateLimit: number | null;
  secret: string;
  subscriberId: string;
  url: string;
}

export interface Message {
  createdAt: string;
  deliveries?: MessageDelivery[];
  eventType?: EventType;
  eventTypeId: string;
  id: string;
  labels: Record<string, string>;
  payload: any;
  status: "PENDING" | "PROCESSING" | "DELIVERED" | "FAILED" | "PARTIAL";
  subscriber?: Subscriber;
  subscriberId: string;
}

export interface MessageDelivery {
  attempts: number;
  createdAt: string;
  deliveredAt: string | null;
  id: string;
  lastError: string | null;
  messageId: string;
  nextRetryAt: string | null;
  status:
    | "PENDING"
    | "PROCESSING"
    | "DELIVERED"
    | "FAILED"
    | "RETRYING"
    | "SKIPPED"
    | "EXPIRED";
  webhook?: Webhook;
  webhookId: string;
}
