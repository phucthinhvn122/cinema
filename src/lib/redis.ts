import Redis from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true, // Prevents blocking next.js boot
    });
    
    redis.on('error', (err) => {
      // Graceful warn on terminal, don't crash next process
      console.warn('Redis connection failed: ' + err.message);
    });
  } catch (error) {
    console.warn('Failed to initialize Redis client: ', error);
  }
}

export default redis;
