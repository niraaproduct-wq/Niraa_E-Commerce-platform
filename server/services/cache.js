const logger = require('../utils/logger');

/**
 * Resilient Cache Service
 * Provides active in-memory TTL caching with a silent, seamless upgrade path to Upstash/Redis when available.
 * Guaranteed never to crash the application, even if external Redis connections fail.
 */
class CacheService {
  constructor() {
    this._store = new Map();
    this.isRedis = false;
    this.redisClient = null;

    // Automatic GC (Garbage Collection) for expired cache entries every 60 seconds
    this._gcInterval = setInterval(() => this._performGC(), 60000);
    this._gcInterval.unref(); // Allow the process to exit cleanly in testing

    this._initializeRedis();
  }

  /**
   * Attempt to load and initialize external Redis client if configured
   */
  _initializeRedis() {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl) {
      logger.info('[Cache] No Redis credentials found. Operating in optimized in-memory cache mode.');
      return;
    }

    try {
      // Safely try to load Upstash Redis dynamically
      const { Redis } = require('@upstash/redis');
      if (redisUrl && redisToken) {
        this.redisClient = new Redis({
          url: redisUrl,
          token: redisToken,
        });
        this.isRedis = true;
        logger.info('[Cache] Successfully connected to Upstash Redis Cloud storage.');
      } else {
        // Safe check for native Redis via ioredis or redis npm packages if configured
        const IORedis = require('ioredis');
        this.redisClient = new IORedis(redisUrl);
        this.isRedis = true;
        logger.info('[Cache] Connected to native Redis database instance.');
      }
    } catch (e) {
      logger.warn('[Cache] Dynamic Redis packages missing or connection failed. Falling back to robust in-memory store.', { error: e.message });
      this.isRedis = false;
      this.redisClient = null;
    }
  }

  /**
   * Get a cached value
   * @param {string} key 
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (this.isRedis && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        if (val === null) return null;
        // Upstash might auto-parse JSON or return strings
        return typeof val === 'string' ? JSON.parse(val) : val;
      } catch (err) {
        logger.error('[Cache] Redis get error, using memory fallback:', err.message);
      }
    }

    const entry = this._store.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a cached value with TTL
   * @param {string} key 
   * @param {any} value 
   * @param {number} [ttlSeconds=300] Time to live in seconds (default: 5 minutes)
   */
  async set(key, value, ttlSeconds = 300) {
    const stringifiedValue = JSON.stringify(value);

    if (this.isRedis && this.redisClient) {
      try {
        // Set with TTL (EX option)
        await this.redisClient.set(key, stringifiedValue, { ex: ttlSeconds });
        return;
      } catch (err) {
        logger.error('[Cache] Redis set error, using memory fallback:', err.message);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this._store.set(key, {
      value: JSON.parse(stringifiedValue), // Clone object to avoid in-memory reference mutation
      expiresAt
    });
  }

  /**
   * Invalidate/Delete a specific cache key
   * @param {string} key 
   */
  async del(key) {
    if (this.isRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch (err) {
        logger.error('[Cache] Redis delete error:', err.message);
      }
    }

    this._store.delete(key);
  }

  /**
   * Flush/Delete cache keys matching a specific pattern (e.g. invalidation strategies)
   * @param {string} pattern Pattern to search and invalidate
   */
  async invalidatePattern(pattern) {
    logger.info(`[Cache] Invalidating all cache keys matching pattern: "${pattern}"`);
    
    if (this.isRedis && this.redisClient) {
      try {
        // Safe pattern invalidation depending on Redis type
        if (typeof this.redisClient.keys === 'function') {
          const keys = await this.redisClient.keys(pattern);
          if (keys && keys.length > 0) {
            await this.redisClient.del(...keys);
          }
        } else {
          // Upstash or REST command fallback
          const keys = await this.redisClient.keys(pattern);
          for (const key of keys) {
            await this.redisClient.del(key);
          }
        }
        return;
      } catch (err) {
        logger.error('[Cache] Redis pattern invalidation error:', err.message);
      }
    }

    // In-memory key wildcard/substring matching
    const matchRegex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this._store.keys()) {
      if (matchRegex.test(key)) {
        this._store.delete(key);
      }
    }
  }

  /**
   * Clear all cache values
   */
  async flushAll() {
    if (this.isRedis && this.redisClient) {
      try {
        await this.redisClient.flushall();
        return;
      } catch (err) {
        logger.error('[Cache] Redis flush error:', err.message);
      }
    }

    this._store.clear();
    logger.info('[Cache] Memory store flushed completely.');
  }

  /**
   * Internal GC routine to remove expired records and free up heap memory
   */
  _performGC() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this._store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this._store.delete(key);
        count++;
      }
    }
    if (count > 0) {
      logger.debug(`[Cache] Garbage collection cycle complete. Removed ${count} expired entries.`);
    }
  }
}

module.exports = new CacheService();
