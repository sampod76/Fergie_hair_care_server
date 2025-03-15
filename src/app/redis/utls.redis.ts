import { Request } from 'express';

export class CacheKeyGenerator {
  readonly baseUrl: string;
  readonly params: Record<string, any> = {};
  constructor(req: Request) {
    // any / to replace : --> /api/v1/users/123 to api:v1:users:123
    const path = req.originalUrl.replace(/\?.*$/, '');
    // this.baseUrl = req.path.replace(/^\/+|\/$/g, '').replace(/\//g, ':');
    this.baseUrl = path.replace(/^\/+|\/$/g, '').replace(/\//g, ':');
    Object.entries(req.query).forEach(([key, value]) => {
      if (value && Boolean(value)) {
        this.params[key] = value;
      }
    });
  }
  public generateSortParams(): string {
    return Object.keys(this.params)
      .sort()
      .map(key => `${key}=${this.params[key]}`)
      .join('&');
  }
  public generateKey(): string {
    const sortParams = this.generateSortParams();
    return sortParams ? `${this.baseUrl}:${sortParams}` : this.baseUrl;
  }
}

/* import { redisClient } from './redis';

export async function deleteAllKeys(pattern: string) {
  let cursor = '0';
  const count = 200; // Reasonable count to balance performance
  let totalDeleted = 0;

  do {
    // Use the SCAN command to find keys
    const [newCursor, foundKeys] = await redisClient.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      count,
    );
    cursor = newCursor;

    if (foundKeys.length > 0) {
      // Delete the keys
      await redisClient.del(...foundKeys);
      totalDeleted += foundKeys.length;
      console.log(
        `Deleted ${foundKeys} keys, total deleted: ${totalDeleted}`.bgRed,
      );
    }
  } while (cursor !== '0');

  console.log(
    `All keys matching the pattern '${pattern}' have been deleted. Total keys deleted: ${totalDeleted}`
      .bgGreen,
  );
}

export type IRedisSetter<T> = {
  key: string;
  value: T;
  ttl?: number;
}[];
export const redisSetter = async <T>(
  data: IRedisSetter<T>,
  ttl = 24 * 60 * 60,
) => {
  try {
    const promises: Promise<string>[] = [];
    data.forEach(value => {
      promises.push(
        redisClient.set(
          value.key,
          typeof value.value !== 'string'
            ? JSON.stringify(value.value)
            : value.value,
          'EX',
          value.ttl || ttl,
        ),
      );
    });

    const res = await Promise.all(promises);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
 */
