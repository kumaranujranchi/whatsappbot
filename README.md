# WhatsApp Personal Assistant Chatbot 🤖

AI-powered WhatsApp Chatbot built with `whatsapp-web.js` and Google Gemini 2.5 Flash API. Answering incoming WhatsApp messages like a Personal Assistant.

---

## 📁 Project Location
Location on Desktop: `~/Desktop/whatsapp-chatbot`

---

## 🚀 How to Setup & Run

### Step 1: Open Terminal and navigate to folder
```bash
cd ~/Desktop/whatsapp-chatbot
```

### Step 2: Set your Gemini API Key
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open `.env` file in the project folder and paste your key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   OWNER_NAME=Anuj
   ASSISTANT_NAME=JARVIS
   LANGUAGE=Hinglish
   ```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the Chatbot
```bash
npm start
```

### Step 5: Link your WhatsApp
1. Terminal par ek **QR Code** display hoga.
2. Mobile me WhatsApp open karein -> Settings (ya 3 dots) -> **Linked Devices**.
3. **Link a Device** par tap karke Terminal wale QR code ko scan karein.
4. Terminal par `🚀 WhatsApp Personal Assistant is ONLINE & READY!` show hone ke baad bot active ho jaayega.

---

## ⚙️ Features
- **Smart AI Replies:** Uses Google Gemini AI to generate contextual, polite assistant replies.
- **Personal Persona:** Speaks in friendly Hinglish/English as your assistant.
- **Group & Self Filtering:** Ignores group messages, status updates, and your own messages.
- **Session Persistence:** Authenticates once; doesn't ask for QR code every time.
