export function getDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JARVIS WhatsApp AI Assistant Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0f172a;
      --card-bg: rgba(30, 41, 59, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #38bdf8;
      --primary-glow: rgba(56, 189, 248, 0.3);
      --accent: #6366f1;
      --success: #22c55e;
      --warning: #eab308;
      --danger: #ef4444;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
    }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%);
      min-height: 100vh;
      color: var(--text-main);
      padding: 2rem 1rem;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-shadow: 0 0 20px var(--primary-glow);
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.9rem;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--card-border);
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--warning);
      box-shadow: 0 0 10px var(--warning);
      animation: pulse 1.5s infinite;
    }

    .pulse-dot.online {
      background-color: var(--success);
      box-shadow: 0 0 10px var(--success);
    }

    .pulse-dot.paused {
      background-color: var(--danger);
      box-shadow: 0 0 10px var(--danger);
      animation: none;
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary);
    }

    .qr-container {
      text-align: center;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 12px;
      border: 1px dashed var(--card-border);
      margin-bottom: 1.5rem;
    }

    .qr-img {
      max-width: 220px;
      border-radius: 8px;
      background: white;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .qr-text {
      margin-top: 1rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .btn {
      width: 100%;
      padding: 0.85rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-toggle-on {
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: white;
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
    }

    .btn-toggle-off {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }

    .btn:hover {
      transform: translateY(-2px);
      filter: brightness(1.1);
    }

    .cmd-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .cmd-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }

    .cmd-code {
      font-family: monospace;
      background: var(--primary-glow);
      color: var(--primary);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .cmd-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .logs-container {
      max-height: 280px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-right: 0.25rem;
    }

    .log-entry {
      font-size: 0.82rem;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.6);
      border-left: 3px solid var(--primary);
    }

    .log-entry.in {
      border-left-color: var(--accent);
    }

    .log-entry.out {
      border-left-color: var(--success);
    }

    .log-entry.error {
      border-left-color: var(--danger);
    }

    .log-time {
      color: var(--text-muted);
      font-size: 0.75rem;
      margin-bottom: 0.2rem;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.4);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--card-border);
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-icon">🤖</div>
        <div>
          <div class="brand-title">JARVIS Assistant Control Panel</div>
          <div class="brand-subtitle">Representing <strong id="owner-name">Owner</strong> on WhatsApp</div>
        </div>
      </div>
      <div class="status-badge">
        <div class="pulse-dot" id="status-dot"></div>
        <span id="status-text">Checking Status...</span>
      </div>
    </header>

    <div class="grid">
      <!-- Bot Status & Control Card -->
      <div class="card">
        <div class="card-title">⚡ Control & QR Authentication</div>
        
        <div id="qr-section" class="qr-container" style="display: none;">
          <img id="qr-image" class="qr-img" src="" alt="WhatsApp QR Code">
          <div class="qr-text">
            📱 Open WhatsApp on your phone $\rightarrow$ <strong>Linked Devices</strong> $\rightarrow$ <strong>Link a Device</strong> and scan this code!
          </div>
        </div>

        <div id="ready-section" class="qr-container" style="display: block;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
          <div style="font-size: 1.1rem; font-weight: 600;" id="session-status-head">WhatsApp Account Connected</div>
          <div class="qr-text" id="session-status-sub">Bot is active and listening for incoming messages 24/7.</div>
        </div>

        <button id="toggle-btn" class="btn btn-toggle-off" onclick="toggleBot()">
          🛑 Pause AI Auto-Reply
        </button>
      </div>

      <!-- Quick Commands Card -->
      <div class="card">
        <div class="card-title">📱 Mobile Remote Control Commands</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Type these commands directly from your phone in WhatsApp to control the bot anytime:
        </p>
        <div class="cmd-list">
          <div class="cmd-item">
            <span class="cmd-code">!off</span>
            <span class="cmd-desc">Pause auto-replies</span>
          </div>
          <div class="cmd-item">
            <span class="cmd-code">!on</span>
            <span class="cmd-desc">Resume auto-replies</span>
          </div>
          <div class="cmd-item">
            <span class="cmd-code">!status</span>
            <span class="cmd-desc">Check bot status</span>
          </div>
        </div>
      </div>

      <!-- Activity Logs Card -->
      <div class="card" style="grid-column: 1 / -1;">
        <div class="card-title">📜 Real-Time Activity Feed</div>
        <div class="logs-container" id="logs-list">
          <div class="log-entry">Waiting for activity logs...</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let isBotActive = true;

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();

        document.getElementById('owner-name').innerText = data.ownerName || 'Anuj';

        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        const qrSection = document.getElementById('qr-section');
        const readySection = document.getElementById('ready-section');
        const toggleBtn = document.getElementById('toggle-btn');

        isBotActive = data.isBotActive;

        if (isBotActive) {
          toggleBtn.className = 'btn btn-toggle-off';
          toggleBtn.innerHTML = '🛑 Pause AI Auto-Reply';
        } else {
          toggleBtn.className = 'btn btn-toggle-on';
          toggleBtn.innerHTML = '✅ Activate AI Auto-Reply';
        }

        if (data.status === 'QR_READY' && data.qrCodeDataUrl) {
          dot.className = 'pulse-dot';
          text.innerText = 'WAITING FOR QR SCAN';
          qrSection.style.display = 'block';
          readySection.style.display = 'none';
          document.getElementById('qr-image').src = data.qrCodeDataUrl;
        } else if (data.status === 'ONLINE' || data.status === 'AUTHENTICATED') {
          qrSection.style.display = 'none';
          readySection.style.display = 'block';

          if (!data.isBotActive) {
            dot.className = 'pulse-dot paused';
            text.innerText = 'PAUSED';
            document.getElementById('session-status-head').innerText = 'AI Auto-Reply Paused';
            document.getElementById('session-status-sub').innerText = 'WhatsApp is connected, but auto-replying is paused by owner.';
          } else {
            dot.className = 'pulse-dot online';
            text.innerText = 'ONLINE & READY';
            document.getElementById('session-status-head').innerText = 'WhatsApp Account Connected';
            document.getElementById('session-status-sub').innerText = 'Bot is active and listening for incoming messages 24/7.';
          }
        } else {
          dot.className = 'pulse-dot';
          text.innerText = data.status || 'INITIALIZING';
          qrSection.style.display = 'none';
          readySection.style.display = 'block';
        }

        // Update logs
        if (data.logs && data.logs.length > 0) {
          const logsHtml = data.logs.map(log => {
            let typeClass = '';
            if (log.text.includes('Received message')) typeClass = 'in';
            if (log.text.includes('Sent auto-reply')) typeClass = 'out';
            if (log.text.includes('Error')) typeClass = 'error';

            return \`
              <div class="log-entry \${typeClass}">
                <div class="log-time">\${log.time}</div>
                <div>\${log.text}</div>
              </div>
            \`;
          }).reverse().join('');
          document.getElementById('logs-list').innerHTML = logsHtml;
        }
      } catch (err) {
        console.error('Error fetching dashboard status:', err);
      }
    }

    async function toggleBot() {
      try {
        await fetch('/api/toggle', { method: 'POST' });
        fetchStatus();
      } catch (err) {
        console.error('Error toggling bot state:', err);
      }
    }

    // Poll status every 2 seconds
    fetchStatus();
    setInterval(fetchStatus, 2000);
  </script>
</body>
</html>`;
}
