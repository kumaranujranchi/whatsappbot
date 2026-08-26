import { createWhatsAppBot } from './bot.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('===================================================');
console.log('   🤖 WHATSAPP PERSONAL ASSISTANT BOT STARTING     ');
console.log('===================================================\n');

const bot = createWhatsAppBot();
bot.initialize();

process.on('SIGINT', async () => {
  console.log('\nShutting down WhatsApp Bot gracefully...');
  await bot.destroy();
  process.exit(0);
});
