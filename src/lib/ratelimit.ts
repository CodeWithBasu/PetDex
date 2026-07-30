import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedisEnv ? Redis.fromEnv() : null;

const realRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "24 h"),
      prefix: "petdex:submit",
      analytics: true,
    })
  : null;

export const submitRatelimit = {
  limit: async (identifier: string) => {
    if (!realRatelimit) {
      return { success: true, remaining: 3, reset: Date.now(), limit: 3 };
    }
    try {
      return await realRatelimit.limit(identifier);
    } catch (err) {
      console.warn("Upstash Redis error, bypassing ratelimit", err);
      return { success: true, remaining: 3, reset: Date.now(), limit: 3 };
    }
  },
};
