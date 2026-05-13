import { redisClient } from "@/configs/redis";
import { logger } from "@/lib/logger";

const CIRCUIT_BREAKER_PREFIX = "circuit_breaker:";
const FAILURE_THRESHOLD = 10; // Number of consecutive failures before opening circuit
const RECOVERY_TIMEOUT = 300; // 5 minutes in seconds
const FAILURE_WINDOW = 60; // Track failures in last 60 seconds

export const CircuitState = {
  CLOSED: "CLOSED", // Normal operation
  OPEN: "OPEN", // Circuit is open, requests are blocked
  HALF_OPEN: "HALF_OPEN", // Testing if service recovered
} as const;

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState];

interface CircuitBreakerData {
  failureCount: number;
  lastFailureTime: number;
  openedAt?: number;
  state: CircuitState;
}

/**
 * Get circuit breaker state for a webhook
 */
export async function getCircuitState(
  webhookId: string
): Promise<CircuitState> {
  try {
    const key = `${CIRCUIT_BREAKER_PREFIX}${webhookId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return CircuitState.CLOSED;
    }

    const circuit: CircuitBreakerData = JSON.parse(data);
    const now = Date.now();

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (
      circuit.state === CircuitState.OPEN &&
      circuit.openedAt &&
      now - circuit.openedAt > RECOVERY_TIMEOUT * 1000
    ) {
      await updateCircuitState(webhookId, CircuitState.HALF_OPEN, 0);
      return CircuitState.HALF_OPEN;
    }

    return circuit.state;
  } catch (error) {
    logger.error(`Error getting circuit state: ${error}`);
    return CircuitState.CLOSED; // Fail open
  }
}

/**
 * Record a successful webhook delivery
 */
export async function recordSuccess(webhookId: string): Promise<void> {
  try {
    const key = `${CIRCUIT_BREAKER_PREFIX}${webhookId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return;
    }

    const circuit: CircuitBreakerData = JSON.parse(data);

    // If in HALF_OPEN state and success, close the circuit
    if (circuit.state === CircuitState.HALF_OPEN) {
      await redisClient.del(key);
      logger.info(`Circuit breaker closed for webhook ${webhookId}`);
    } else if (circuit.state === CircuitState.CLOSED) {
      // Reset failure count on success
      await updateCircuitState(webhookId, CircuitState.CLOSED, 0);
    }
  } catch (error) {
    logger.error(`Error recording success: ${error}`);
  }
}

/**
 * Record a failed webhook delivery
 */
export async function recordFailure(webhookId: string): Promise<void> {
  try {
    const key = `${CIRCUIT_BREAKER_PREFIX}${webhookId}`;
    const data = await redisClient.get(key);
    const now = Date.now();

    let circuit: CircuitBreakerData;

    if (data) {
      circuit = JSON.parse(data);

      // Reset count if last failure was outside the window
      if (now - circuit.lastFailureTime > FAILURE_WINDOW * 1000) {
        circuit.failureCount = 1;
      } else {
        circuit.failureCount += 1;
      }

      circuit.lastFailureTime = now;
    } else {
      circuit = {
        state: CircuitState.CLOSED,
        failureCount: 1,
        lastFailureTime: now,
      };
    }

    // Open circuit if threshold exceeded
    if (circuit.failureCount >= FAILURE_THRESHOLD) {
      circuit.state = CircuitState.OPEN;
      circuit.openedAt = now;
      logger.warn(
        `Circuit breaker opened for webhook ${webhookId} after ${circuit.failureCount} failures`
      );
    }

    await redisClient.setex(key, RECOVERY_TIMEOUT * 2, JSON.stringify(circuit));
  } catch (error) {
    logger.error(`Error recording failure: ${error}`);
  }
}

/**
 * Update circuit breaker state
 */
async function updateCircuitState(
  webhookId: string,
  state: CircuitState,
  failureCount: number
): Promise<void> {
  const key = `${CIRCUIT_BREAKER_PREFIX}${webhookId}`;
  const circuit: CircuitBreakerData = {
    state,
    failureCount,
    lastFailureTime: Date.now(),
  };

  await redisClient.setex(key, RECOVERY_TIMEOUT * 2, JSON.stringify(circuit));
}

/**
 * Check if request should be allowed through circuit breaker
 */
export async function shouldAllowRequest(webhookId: string): Promise<boolean> {
  const state = await getCircuitState(webhookId);
  return state !== CircuitState.OPEN;
}
