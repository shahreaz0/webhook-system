import { jwtVerify, SignJWT } from "jose";

const encoder = new TextEncoder();

export async function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn = "7d"
): Promise<string> {
  const key = encoder.encode(secret);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJwt<T = unknown>(
  token: string,
  secret: string
): Promise<T> {
  const key = encoder.encode(secret);

  const { payload } = await jwtVerify(token, key, {
    algorithms: ["HS512"],
  });

  return payload as T;
}

export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 19_456,
    timeCost: 2,
  });
}

export async function verifyPassword(
  hashed: string,
  plain: string
): Promise<boolean> {
  return await Bun.password.verify(plain, hashed);
}
