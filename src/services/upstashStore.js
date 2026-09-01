import { Redis } from '@upstash/redis';
import fs from 'fs';

/**
 * Upstash Redis store for whatsapp-web.js RemoteAuth
 * Free tier: 10,000 commands/day — more than enough for session sync every 5 min
 */
export class UpstashStore {
  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_TOKEN;
    
    this.redis = new Redis({
      url,
      token,
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
      const zipPath = `${options.session}.zip`;
      if (!fs.existsSync(zipPath)) {
        console.warn(`UpstashStore: ${zipPath} does not exist yet to save.`);
        return;
      }
      const fileData = fs.readFileSync(zipPath);
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
      if (!base64) {
        console.log('ℹ️ No existing session found in Upstash Redis.');
        return;
      }
      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(options.path, buffer);
      console.log('📦 Session successfully extracted from Upstash Redis.');
    } catch (err) {
      console.error('UpstashStore extract error:', err.message);
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
