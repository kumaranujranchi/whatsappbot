import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import { generateAssistantReply } from './services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

export const botState = {
  status: 'INITIALIZING',
  qrCodeDataUrl: null,
  isBotActive: true,
  ownerName: process.env.OWNER_NAME || 'Vastu Vihar',
  assistantName: process.env.ASSISTANT_NAME || 'Vastu Vihar Ai Assistance',
  logs: []
};

function addLog(text) {
  const time = new Date().toLocaleTimeString();
  botState.logs.push({ time, text });
  if (botState.logs.length > 40) {
    botState.logs.shift();
  }
}

export function toggleBotActive() {
  botState.isBotActive = !botState.isBotActive;
  addLog(botState.isBotActive ? '✅ Bot auto-reply ACTIVATED from Dashboard.' : '🛑 Bot auto-reply PAUSED from Dashboard.');
  return botState.isBotActive;
}

export function createWhatsAppBot() {
  console.log('🤖 Initializing WhatsApp Personal Assistant Client...');
  addLog('🤖 Initializing WhatsApp Personal Assistant Client...');

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: process.env.AUTH_DATA_PATH || './.wwebjs_auth'
    }),
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018944885-alpha.html',
    },
    authTimeoutMs: 600000,
    protocolTimeout: 120000, // 2 min — fixes ProtocolError on cloud servers
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
        '--single-process',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--mute-audio',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--memory-pressure-off',
        '--disable-features=TranslateUI'
      ]
    }
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading WhatsApp Web (${percent}%): ${message}`);
    botState.status = 'LOADING';
    addLog(`⏳ Loading WhatsApp Web (${percent}%): ${message}`);
  });

  client.on('qr', async (qr) => {
    // Ignore stray QR events if client is already connected & ready
    if (botState.status === 'ONLINE' && client.info) {
      return;
    }

    console.log('\n======================================================');
    console.log('📲 SCAN THIS QR CODE WITH YOUR WHATSAPP MOBILE APP:');
    console.log('======================================================\n');
    qrcodeTerminal.generate(qr, { small: true });
    
    botState.status = 'QR_READY';
    try {
      botState.qrCodeDataUrl = await QRCode.toDataURL(qr);
    } catch (e) {
      console.error('Error generating QR Data URL:', e);
    }
    addLog('📲 New QR Code generated. Scan with WhatsApp on phone or Web Dashboard!');
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp Authentication successful!');
    botState.status = 'AUTHENTICATED';
    botState.qrCodeDataUrl = null;
    addLog('✅ WhatsApp Authentication successful! Syncing session...');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Authentication failed:', msg);
    botState.status = 'AUTH_FAILURE';
    botState.qrCodeDataUrl = null;
    addLog(`❌ WhatsApp Authentication failed: ${msg}`);
  });

  client.on('change_state', (state) => {
    console.log('🔄 WhatsApp State Changed:', state);
    addLog(`🔄 WhatsApp State Changed: ${state}`);
  });

  let botStartTime = Math.floor(Date.now() / 1000) - 60;

  client.on('ready', () => {
    botStartTime = Math.floor(Date.now() / 1000) - 300; // 5 min buffer
    botState.status = 'ONLINE';
    botState.qrCodeDataUrl = null;
    console.log('\n🚀 WhatsApp Personal Assistant is ONLINE & READY!');
    console.log(`Listening for NEW incoming messages on behalf of ${process.env.OWNER_NAME || 'Owner'}...\n`);
    addLog(`🚀 WhatsApp Personal Assistant is ONLINE & READY! Listening on behalf of ${botState.ownerName}.`);
  });

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client Disconnected:', reason);
    botState.status = 'DISCONNECTED';
    botState.qrCodeDataUrl = null;
    addLog(`❌ WhatsApp Client Disconnected: ${reason}`);
  });

  // Handle owner control commands sent from owner's phone
  client.on('message_create', async (message) => {
    if (!message.fromMe) return;

    const command = message.body ? message.body.trim().toLowerCase() : '';

    if (command === '!bot off' || command === '!off' || command === '!pause') {
      botState.isBotActive = false;
      await message.reply('🛑 *Vastu Vihar Remote Control*: Auto-reply PAUSED. Bot will no longer reply to incoming messages.');
      console.log('🛑 Owner paused bot auto-reply.');
      addLog('🛑 Owner paused bot auto-reply via WhatsApp.');
    } else if (command === '!bot on' || command === '!on' || command === '!start') {
      botState.isBotActive = true;
      await message.reply('✅ *Vastu Vihar Remote Control*: Auto-reply ACTIVATED. Bot will now respond to incoming messages.');
      console.log('✅ Owner activated bot auto-reply.');
      addLog('✅ Owner activated bot auto-reply via WhatsApp.');
    } else if (command === '!bot status' || command === '!status') {
      await message.reply(`🤖 *Vastu Vihar Status*: ${botState.isBotActive ? '✅ ACTIVE (Auto-reply is ON)' : '🛑 PAUSED (Auto-reply is OFF)'}`);
    }
  });

  client.on('message', async (message) => {
    try {
      // If messages are flowing, bot is definitely online
      botState.status = 'ONLINE';
      botState.qrCodeDataUrl = null;

      // If bot is paused by owner, ignore incoming messages
      if (!botState.isBotActive) {
        return;
      }

      // Ignore statuses, groups, broadcast messages
      if (message.isStatus || message.from.endsWith('@g.us') || message.from === 'status@broadcast') {
        return;
      }

      // Ignore self messages (messages sent from the connected phone)
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
      addLog(`📩 Received message from ${senderName}: "${incomingText}"`);

      console.log('🤖 Generating AI Assistant reply...');
      const replyText = await generateAssistantReply(message.from, senderName, incomingText);

      await message.reply(replyText);
      console.log(`📤 Sent auto-reply to ${senderName}: "${replyText}"`);
      addLog(`📤 Sent auto-reply to ${senderName}: "${replyText}"`);

    } catch (err) {
      console.error('Error handling incoming message:', err);
      addLog(`❌ Error handling message: ${err.message}`);
    }
  });

  return client;
}
