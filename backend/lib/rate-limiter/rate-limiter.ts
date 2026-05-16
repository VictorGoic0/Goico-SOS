import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config } from "../config";
import { RATE_LIMIT_GLOBAL_PER_DAY, RATE_LIMIT_USER_PER_DAY } from "./consts";

class RateLimiter {
  private redis: Redis;
  private userLimiter: Ratelimit;
  private globalLimiter: Ratelimit;

  constructor(redis: Redis) {
    this.redis = redis;

    this.userLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.fixedWindow(RATE_LIMIT_USER_PER_DAY, "24 h"),
      prefix: "rate:user:sos",
    });

    this.globalLimiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.fixedWindow(RATE_LIMIT_GLOBAL_PER_DAY, "24 h"),
      prefix: "rate:global:sos",
    });
  }

  async enforce(uid: string): Promise<void> {
    await this.enforceGlobalLimit();
    await this.enforceUserLimit(uid);
  }

  private async enforceGlobalLimit(): Promise<void> {
    const result = await this.globalLimiter.limit("app");

    if (!result.success) {
      throw new Response(
        JSON.stringify({
          error: "RateLimitExceeded",
          detail: `App daily request limit reached (${RATE_LIMIT_GLOBAL_PER_DAY}/day).`,
          retryAfter: this.retryAfterSeconds(result.reset),
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  private async enforceUserLimit(uid: string): Promise<void> {
    const result = await this.userLimiter.limit(uid);

    if (!result.success) {
      throw new Response(
        JSON.stringify({
          error: "RateLimitExceeded",
          detail: `You have reached your daily request limit (${RATE_LIMIT_USER_PER_DAY}/day).`,
          retryAfter: this.retryAfterSeconds(result.reset),
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  private retryAfterSeconds(resetMs: number): number {
    return Math.max(0, Math.ceil((resetMs - Date.now()) / 1000));
  }
}

const redis = new Redis({
  url: config.UPSTASH_REDIS_REST_URL,
  token: config.UPSTASH_REDIS_REST_TOKEN,
});

export const rateLimiter = new RateLimiter(redis);
