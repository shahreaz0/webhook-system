import { prisma } from "@webhook/database";
export function generateSessionToken(): string {
  // Generate 32 random bytes and encode as base64url
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("base64url");
}

export async function createSession(
  userId: string,
  ipAddress: string | undefined,
  userAgent: string | undefined
) {
  const token = generateSessionToken();

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    omit: {
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      userId: true,
    },
  });

  return session;
}
