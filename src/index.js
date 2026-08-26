import { createWhatsAppBot, botState, toggleBotActive } from './bot.js';
import { getDashboardHtml } from './dashboardHtml.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

console.log('===================================================');
console.log('   🤖 WHATSAPP PERSONAL ASSISTANT BOT STARTING     ');
console.log('===================================================\n');

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(botState));
    return;
  }

  if (req.url === '/api/toggle' && req.method === 'POST') {
    const isBotActive = toggleBotActive();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, isBotActive }));
    return;
  }

  // Default: Serve Web Dashboard
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(getDashboardHtml());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Dashboard & Health Check HTTP server listening on 0.0.0.0:${PORT}`);
});

const bot = createWhatsAppBot();
bot.initialize();

process.on('SIGINT', async () => {
  console.log('\nShutting down WhatsApp Bot gracefully...');
  await bot.destroy();
  process.exit(0);
});
