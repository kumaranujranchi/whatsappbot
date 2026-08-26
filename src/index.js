import { createWhatsAppBot } from './bot.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('===================================================');
console.log('   🤖 WHATSAPP PERSONAL ASSISTANT BOT STARTING     ');
console.log('===================================================\n');

import http from 'http';

const PORT = process.env.PORT || 8000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 WhatsApp Personal Assistant Bot is ONLINE & READY!');
});

server.listen(PORT, () => {
  console.log(`🌐 Health check HTTP server listening on port ${PORT}`);
});

const bot = createWhatsAppBot();
bot.initialize();

process.on('SIGINT', async () => {
  console.log('\nShutting down WhatsApp Bot gracefully...');
  await bot.destroy();
  process.exit(0);
});
