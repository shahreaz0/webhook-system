import type {
  Application,
  EventType,
  Message,
  Session,
  Subscriber,
  User,
  Webhook,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088";

// Authenticated fetch wrapper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("webhook_jwt_token");

  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message || body?.error || `HTTP Error: ${res.status}`
    );
  }

  const body = await res.json();
  return body.data === undefined ? body : body.data;
}

export const apiClient = {
  // ---------------------------------
  // Authentication
  // ---------------------------------
  async login(payload: { email: string; password: string }): Promise<{
    success: boolean;
    user: User;
    session: Session;
    jwtToken: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }
    const data = await res.json();

    // Exchange session token for a short-lived JWT
    const tokenRes = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: { token: data.session.token },
    });
    const tokenData = await tokenRes.json();

    if (typeof window !== "undefined") {
      localStorage.setItem("webhook_session_token", data.session.token);
      localStorage.setItem("webhook_jwt_token", tokenData.data.token);
      localStorage.setItem("webhook_user", JSON.stringify(data.user));
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      jwtToken: tokenData.data.token,
    };
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Registration failed");
    }
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const sessionToken =
      typeof window === "undefined"
        ? null
        : localStorage.getItem("webhook_session_token");

    if (typeof window !== "undefined") {
      localStorage.removeItem("webhook_session_token");
      localStorage.removeItem("webhook_jwt_token");
      localStorage.removeItem("webhook_user");
    }

    if (sessionToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { token: sessionToken },
        });
      } catch {
        // Safe to ignore — token is already cleared locally
      }
    }
    return { success: true };
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = localStorage.getItem("webhook_user");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // ---------------------------------
  // Applications
  // ---------------------------------
  async getApplications(): Promise<Application[]> {
    return await request("/applications", { method: "GET" });
  },

  async createApplication(
    name: string,
    description: string
  ): Promise<Application> {
    return await request("/applications", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  },

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    return await request(`/applications/${id}`, { method: "DELETE" });
  },

  // ---------------------------------
  // Event Types
  // ---------------------------------
  async getEventTypes(applicationId: string): Promise<EventType[]> {
    return await request(`/event-types?applicationId=${applicationId}`, {
      method: "GET",
    });
  },

  async createEventType(payload: {
    name: string;
    description: string;
    groupName: string;
    applicationId: string;
  }): Promise<EventType> {
    return await request("/event-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ---------------------------------
  // Subscribers
  // ---------------------------------
  async getSubscribers(applicationId: string): Promise<Subscriber[]> {
    return await request(`/subscribers?applicationId=${applicationId}`, {
      method: "GET",
    });
  },

  async createSubscriber(payload: {
    applicationId: string;
    referenceId: string;
    email: string;
    metadata: any;
  }): Promise<Subscriber> {
    return await request("/subscribers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteSubscriber(id: string): Promise<{ success: boolean }> {
    return await request(`/subscribers/${id}`, { method: "DELETE" });
  },

  // ---------------------------------
  // Webhooks
  // ---------------------------------
  async getWebhooks(subscriberId: string): Promise<Webhook[]> {
    return await request(`/webhooks?subscriberId=${subscriberId}`, {
      method: "GET",
    });
  },

  async createWebhook(payload: {
    url: string;
    description: string;
    rateLimit: number | null;
    subscriberId: string;
    eventTypeIds: string[];
  }): Promise<Webhook> {
    return await request("/webhooks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateWebhook(
    id: string,
    payload: {
      url: string;
      description: string;
      rateLimit: number | null;
      disabled: boolean;
      eventTypeIds: string[];
    }
  ): Promise<Webhook> {
    return await request(`/webhooks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteWebhook(id: string): Promise<{ success: boolean }> {
    return await request(`/webhooks/${id}`, { method: "DELETE" });
  },

  // ---------------------------------
  // Messages & Deliveries
  // ---------------------------------
  async getMessages(subscriberId?: string): Promise<Message[]> {
    const path = subscriberId
      ? `/messages?subscriberId=${subscriberId}`
      : "/messages";
    return await request(path, { method: "GET" });
  },

  async triggerMessage(payload: {
    subscriberId: string;
    eventTypeId: string;
    payload: any;
  }): Promise<Message> {
    return await request("/messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
