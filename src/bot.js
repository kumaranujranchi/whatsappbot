import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { generateAssistantReply } from './services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

export function createWhatsAppBot() {
  console.log('🤖 Initializing WhatsApp Personal Assistant Client...');

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './.wwebjs_auth'
    }),
    authTimeoutMs: 600000,
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log('📲 SCAN THIS QR CODE WITH YOUR WHATSAPP MOBILE APP:');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
    console.log('\nSteps to Scan:');
    console.log('1. Open WhatsApp on your mobile phone');
    console.log('2. Tap Menu (3 dots) / Settings -> Linked Devices');
    console.log('3. Tap "Link a Device" and scan the QR code above.');
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp Authentication successful!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Authentication failed:', msg);
  });

  let botStartTime = Math.floor(Date.now() / 1000);
  let isBotActive = true;

  client.on('ready', () => {
    botStartTime = Math.floor(Date.now() / 1000);
    console.log('\n🚀 WhatsApp Personal Assistant is ONLINE & READY!');
    console.log(`Listening for NEW incoming messages on behalf of ${process.env.OWNER_NAME || 'Owner'}...\n`);
  });

  // Handle owner control commands sent from owner's phone
  client.on('message_create', async (message) => {
    if (!message.fromMe) return;

    const command = message.body ? message.body.trim().toLowerCase() : '';

    if (command === '!bot off' || command === '!off' || command === '!pause') {
      isBotActive = false;
      await message.reply('🛑 *JARVIS Remote Control*: Auto-reply PAUSED. Bot will no longer reply to incoming messages.');
      console.log('🛑 Owner paused bot auto-reply.');
    } else if (command === '!bot on' || command === '!on' || command === '!start') {
      isBotActive = true;
      await message.reply('✅ *JARVIS Remote Control*: Auto-reply ACTIVATED. Bot will now respond to incoming messages.');
      console.log('✅ Owner activated bot auto-reply.');
    } else if (command === '!bot status' || command === '!status') {
      await message.reply(`🤖 *JARVIS Status*: ${isBotActive ? '✅ ACTIVE (Auto-reply is ON)' : '🛑 PAUSED (Auto-reply is OFF)'}`);
    }
  });

  client.on('message', async (message) => {
    try {
      // If bot is paused by owner, ignore incoming messages
      if (!isBotActive) {
        return;
      }

      // Ignore statuses, groups, broadcast messages
      if (message.isStatus || message.from.endsWith('@g.us') || message.from === 'status@broadcast') {
        return;
      }

      // Ignore self messages
      if (message.fromMe) {
        return;
      }

      // Ignore old messages sent before bot started running
      if (message.timestamp && message.timestamp < botStartTime) {
        console.log(`⏳ Ignoring past message from ${message.from} (sent before bot startup).`);
        return;
      }

      // Ignore empty messages
      if (!message.body || !message.body.trim()) {
        return;
      }

      const contact = await message.getContact();
      const senderName = contact.pushname || contact.name || 'Friend';
      const incomingText = message.body;

      console.log(`\n📩 Received message from ${senderName} (${message.from}): "${incomingText}"`);

      console.log('🤖 Generating AI Assistant reply...');
      const replyText = await generateAssistantReply(message.from, senderName, incomingText);

      await message.reply(replyText);
      console.log(`📤 Sent auto-reply to ${senderName}: "${replyText}"`);

    } catch (err) {
      console.error('Error handling incoming message:', err);
    }
  });

  return client;
}
