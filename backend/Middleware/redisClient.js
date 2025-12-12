import dotenv from "dotenv"
dotenv.config();
// Dynamic import for ioredis to handle cases where it's not installed
let Redis;
try {
  const RedisModule = await import("ioredis"); // async import
  Redis = RedisModule.default; // make sure to take default
} catch (error) {
  console.log("ioredis not installed", error);
}
// Redis configuration
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB || "0");

/**
 * Redis client instance
 */
let redisClient= null;
let isRedisAvailable = false;

/**
 * Initialize Redis connection
 */
const initializeRedis = () => {
  if (!Redis) {
    console.log("ioredis not available - Skipping Redis initialization", {
      logType: "REDIS_INIT_SKIPPED",
    });
    return;
  }

  try {
    // Try to create Redis client
    if (REDIS_URL && REDIS_URL.startsWith("redis://")) {
      redisClient = new Redis(REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
      });
    } else {
      redisClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: REDIS_DB,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
      });
    }

    // Handle connection events
    redisClient.on("connect", () => {
      console.log("Redis connected successfully", {
        logType: "REDIS_CONNECTED",
        host: REDIS_HOST,
        port: REDIS_PORT,
      });
      isRedisAvailable = true;
    });

    redisClient.on("ready", () => {
      console.log("Redis ready for operations", {
        logType: "REDIS_READY",
      });
      isRedisAvailable = true;
    });

    redisClient.on("error", (error) => {
      console.log("Redis connection error", {
        logType: "REDIS_CONNECTION_ERROR",
        errorMessage: error.message,
        host: REDIS_HOST,
        port: REDIS_PORT,
      });
      isRedisAvailable = false;
    });

    redisClient.on("close", () => {
      console.log("Redis connection closed", {
        logType: "REDIS_CONNECTION_CLOSED",
      });
      isRedisAvailable = false;
    });

    redisClient.on("reconnecting", () => {
      console.log("Redis reconnecting...", {
        logType: "REDIS_RECONNECTING",
      });
    });

    // Test the connection
    redisClient
      .ping()
      .then(() => {
        isRedisAvailable = true;
        console.log("Redis ping successful", {
          logType: "REDIS_PING_SUCCESS",
        });
      })
      .catch((error) => {
        console.log("Redis ping failed", {
          logType: "REDIS_PING_FAILED",
          errorMessage: error.message,
        });
        isRedisAvailable = false;
      });
  } catch (error) {
    console.log("Failed to initialize Redis", error, {
      logType: "REDIS_INIT_ERROR",
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
    isRedisAvailable = false;
    redisClient = null;
  }
};
/**
 * Get Redis client instance
 * @returns {any | null} Redis client or null if not available
 */
export const getRedisClient = () => {
  return redisClient;
};
/**
 * Check if Redis is available
 * @returns {boolean} True if Redis is connected and ready
 */
export const isRedisConnected = () => {
  return isRedisAvailable && redisClient !== null;
};
/**
 * Store a key-value pair in Redis with expiration
 * @param {string} key - Redis key
 * @param {string} value - Value to store
 * @param {number} expirySeconds - Expiration time in seconds
 * @returns {Promise<boolean>} Success status
 */
export const setWithExpiry = async (key, value, expirySeconds) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    await redisClient.setex(key, expirySeconds, value);
    return true;
  } catch (error) {
    console.log("Redis setex operation failed", {
      logType: "REDIS_SETEX_ERROR",
      key,
      expirySeconds,
      errorMessage: error.message,
    });
    return false;
  }
};
/**
 * Get value from Redis
 * @param {string} key - Redis key
 * @returns {Promise<string | null>} Value or null if not found/error
 */
export const get = async (key) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return null;
    }

    return await redisClient.get(key);
  } catch (error) {
    console.log("Redis get operation failed", {
      logType: "REDIS_GET_ERROR",
      key,
      errorMessage: (error).message,
    });
    return null;
  }
};

/**
 * Delete a key from Redis
 * @param {string} key - Redis key to delete
 * @returns {Promise<boolean>} True if key was deleted, false otherwise
 */
export const del = async (key) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    console.log("Redis del operation failed", {
      logType: "REDIS_DEL_ERROR",
      key,
      errorMessage: (error).message,
    });
    return false;
  }
};

/**
 * Check if a key exists in Redis
 * @param {string} key - Redis key to check
 * @returns {Promise<boolean>} True if key exists
 */
export const exists = async (key) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    const result = await redisClient.exists(key);
    return result > 0;
  } catch (error) {
    console.log("Redis exists operation failed", {
      logType: "REDIS_EXISTS_ERROR",
      key,
      errorMessage: (error).message,
    });
    return false;
  }
};
export const sadd = async (key, value) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    await redisClient.sadd(key, value);
    return true;
  } catch (error) {
    console.log("Redis sadd operation failed", {
      logType: "REDIS_SADD_ERROR",
      key,
      errorMessage: (error).message,
    });
    return false;
  }
};

/**
 * Remove item from a Redis set
 * @param {string} key - Set key
 * @param {string} value - Value to remove
 * @returns {Promise<boolean>} True if item was removed
 */
export const srem = async (key, value) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    const result = await redisClient.srem(key, value);
    return result > 0;
  } catch (error) {
    console.log("Redis srem operation failed", {
      logType: "REDIS_SREM_ERROR",
      key,
      errorMessage: (error).message,
    });
    return false;
  }
};

/**
 * Check if item exists in a Redis set
 * @param {string} key - Set key
 * @param {string} value - Value to check
 * @returns {Promise<boolean>} True if item exists in set
 */
export const sismember = async (key, value) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    const result = await redisClient.sismember(key, value);
    return result === 1;
  } catch (error) {
    console.log("Redis sismember operation failed", {
      logType: "REDIS_SISMEMBER_ERROR",
      key,
      errorMessage: (error).message,
    });
    return false;
  }
};

/**
 * Get all members of a Redis set
 * @param {string} key - Set key
 * @returns {Promise<string[]>} Array of set members
 */
export const smembers = async (key) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return [];
    }

    return await redisClient.smembers(key);
  } catch (error) {
    console.log("Redis smembers operation failed", {
      logType: "REDIS_SMEMBERS_ERROR",
      key,
      errorMessage: (error).message,
    });
    return [];
  }
};

/**
 * Set expiration time for a key
 * @param {string} key - Redis key
 * @param {number} seconds - Expiration time in seconds
 * @returns {Promise<boolean>} Success status
 */
export const expire = async (key, seconds) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return false;
    }

    const result = await redisClient.expire(key, seconds);
    return result === 1;
  } catch (error) {
    console.log("Redis expire operation failed", {
      logType: "REDIS_EXPIRE_ERROR",
      key,
      seconds,
      errorMessage: (error).message,
    });
    return false;
  }
};
/**
 * Get keys matching a pattern
 * @param {string} pattern - Redis key pattern
 * @returns {Promise<string[]>} Array of matching keys
 */
export const keys = async (pattern) => {
  try {
    if (!isRedisConnected() || !redisClient) {
      return [];
    }

    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis keys operation failed", {
      logType: "REDIS_KEYS_ERROR",
      pattern,
      errorMessage: (error).message,
    });
    return [];
  }
};

/**
 * Gracefully close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log("Redis connection closed gracefully", {
        logType: "REDIS_CLOSED",
      });
    } catch (error) {
      console.log("Error closing Redis connection", error, {
        logType: "REDIS_CLOSE_ERROR",
      });
    }
    redisClient = null;
    isRedisAvailable = false;
  }
};

// Initialize Redis connection on module load
initializeRedis();

// Graceful shutdown handling
process.on("SIGINT", closeRedis);
process.on("SIGTERM", closeRedis);

