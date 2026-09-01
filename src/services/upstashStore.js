import { Redis } from '@upstash/redis';
import fs from 'fs';

/**
 * Upstash Redis store for whatsapp-web.js RemoteAuth
 * Free tier: 10,000 commands/day — more than enough for session sync every 5 min
 */
export class UpstashStore {
  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN,
    });
    console.log('✅ UpstashStore initialized.');
  }

  async sessionExists(options) {
    try {
      const data = await this.redis.get(`whatsapp-session:${options.session}`);
      return !!data;
    } catch (err) {
      console.error('UpstashStore sessionExists error:', err.message);
      return false;
    }
  }

  async save(options) {
    try {
      const fileData = fs.readFileSync(`${options.session}.zip`);
      const base64 = fileData.toString('base64');
      // Store with no expiry — session persists forever until deleted
      await this.redis.set(`whatsapp-session:${options.session}`, base64);
      console.log('💾 Session saved to Upstash Redis.');
    } catch (err) {
      console.error('UpstashStore save error:', err.message);
      throw err;
    }
  }

  async extract(options) {
    try {
      const base64 = await this.redis.get(`whatsapp-session:${options.session}`);
      if (!base64) throw new Error('No session found in Upstash Redis.');
      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(`${options.path}/session.zip`, buffer);
      console.log('📦 Session extracted from Upstash Redis.');
    } catch (err) {
      console.error('UpstashStore extract error:', err.message);
      throw err;
    }
  }

  async delete(options) {
    try {
      await this.redis.del(`whatsapp-session:${options.session}`);
      console.log('🗑️ Session deleted from Upstash Redis.');
    } catch (err) {
      console.error('UpstashStore delete error:', err.message);
    }
  }
}
