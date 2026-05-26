import "dotenv/config";
import { createClient } from "redis";

export const redis = createClient({
	password: process.env.REDIS_PASSWORD || undefined,
	database: Number(process.env.REDIS_DB || 0),
	socket: {
		host: process.env.REDIS_HOST || "127.0.0.1",
		port: Number(process.env.REDIS_PORT || 6379),
		connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
		reconnectStrategy: (retries) => {
			if (retries > 5) {
				return new Error("Redis reconnect retries exhausted");
			}

			return Math.min(retries * 100, 3000);
		},
	},
});

redis.on("error", (error) => {
	console.error("Redis error:", error);
});

let connectPromise;

export async function getRedis() {
	if (redis.isOpen) {
		return redis;
	}

	connectPromise ??= redis.connect().finally(() => {
		connectPromise = undefined;
	});

	await connectPromise;

	return redis;
}
