# Webhook System

A robust, scalable webhook delivery system built with **Hono**, **Prisma**, **BullMQ**, and **PostgreSQL**. This system allows applications to register webhooks, define event types, and reliably deliver messages with retries and status tracking.

## Features

- **User & Application Management**: Manage users and their applications.
- **Event Types**: Define custom event schemas for applications.
- **Webhook Registration**: Register endpoints to receive events.
- **Reliable Delivery**: Asynchronous message processing using BullMQ.
- **Retry Mechanism**: Automatic retries for failed deliveries.
- **Status Tracking**: Track the status of every message (Pending, Processing, Delivered, Failed).
- **OpenAPI Documentation**: Auto-generated API documentation.

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Fast, lightweight web standard edge-ready web framework.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database.
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM.
- **Queue**: [BullMQ](https://bullmq.io/) - Message queue based on Redis.
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema declaration and validation.
- **Runtime**: [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- [PostgreSQL](https://www.postgresql.org/) database.
- [Redis](https://redis.io/) server (for BullMQ).

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd webhook-system
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

3.  Set up environment variables:
    Copy `.env.example` to `.env` (create one if it doesn't exist) and configure your database and Redis connections.

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/webhook_db"
    REDIS_URL="redis://localhost:6379"
    JWT_SECRET="your-secret-key"
    ```

4.  Run database migrations:

    ```bash
    bun run migrate
    ```

5.  Generate Prisma client:
    ```bash
    bun run generate
    ```

### Running the Server

Start the development server:

```bash
bun dev
```

The server will start at `http://localhost:3000` (or the port specified in your env).

### API Documentation

Interactive API documentation is available at:

- **Swagger UI / Scalar**: `http://localhost:3000/reference` (or `/doc`)

## Modules Overview

### Auth

- **Register**: Create a new user account.
- **Login**: Authenticate and receive a JWT.

### Applications

- Create and manage applications.
- Each application belongs to a user and can have its own event types and webhooks.

### Event Types

- Define the schema/structure of events that can be sent.
- Example: `billing.order.created`, `iam.user.signup`.

### Webhooks

- Register URLs to receive events.
- Subscribe to specific event types.
- Secure webhooks with secrets.

### Messages

- Trigger events (send messages).
- View message delivery status and logs.

### Users

- Manage user profile (`/users/me`).

## Development

- **Linting**: `bun run check`
- **Type Checking**: `bun run typecheck`
- **Formatting**: `bun run fix`
