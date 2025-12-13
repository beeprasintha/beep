const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { commands } = require('./command');
const config = require('./config');

// ============================================
// 🌍 1. EXPRESS SERVER (RENDER FIX)
// ============================================
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('<h1>🤖 KNIGHT BOT IS RUNNING! 🤖</h1>');
});

app.listen(port, () => {
  console.log(`🌐 Server is running on PORT: ${port}`);
});

// ============================================
// 👇 BOT SETTINGS & VARIABLES
// ============================================
global.autoStatus = config.AUTO_STATUS_SAVE;
const spamMap = new Map(); // Spam කරන අයව මතක තියාගන්න

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    // ⚠️ ඔයාගේ නම්බර් එක මෙතනට දාන්න
    const usePairingCode = true; 
    const phoneNumber = "94771916428"; 

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Pairing Code යැවීම
    if (usePairingCode && !sock.authState.creds.registered) {
        console.log(`Pairing with: ${phoneNumber}`);
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n\n🟢 YOUR PAIRING CODE: ${code}\n\n`);
            } catch (err) {
                console.log("Pairing Code Error:", err);
            }
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Reconnecting...");
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot Connected successfully!');
            console.log('⬇️  Installing Plugins...');
            
            const pluginPath = path.join(__dirname, 'plugins');
            fs.readdirSync(pluginPath).forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === '.js') {
                    require(pluginPath + '/' + plugin);
                    console.log('Plugin Loaded: ' + plugin);
                }
            });
            console.log('✅ All Plugins Loaded!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const mek = m.messages[0];
            if (!mek.message) return;
            if (mek.key.fromMe) return;

            const type = getContentType(mek.message);
            const body = (type === 'conversation') ? mek.message.conversation : 
                         (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                         (type === 'imageMessage') ? mek.message.imageMessage.caption :
                         (type === 'videoMessage') ? mek.message.videoMessage.caption : '';

            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const isOwner = sender.includes(phoneNumber);

            // ============================================
            // 📥 2. AUTO STATUS SAVER & VIEW
            // ============================================
            if (mek.key.remoteJid === 'status@broadcast') {
                if (config.AUTO_STATUS_VIEW) await sock.readMessages([mek.key]);
                if (global.autoStatus) {
                    const caption = mek.message.imageMessage?.caption || mek.message.videoMessage?.caption || "";
                    const ownerJid = phoneNumber + '@s.whatsapp.net';
                    if (mek.message.imageMessage) {
                        let img = await sock.downloadMediaMessage(mek, 'image');
                        await sock.sendMessage(ownerJid, { image: img, caption: caption });
                    } else if (mek.message.videoMessage) {
                        let vid = await sock.downloadMediaMessage(mek, 'video');
                        await sock.sendMessage(ownerJid, { video: vid, caption: caption });
                    }
                }
                return;
            }

            // ============================================
            // 🚫 3. SPAM PROTECTION
            // ============================================
            if (!isGroup && !isOwner) {
                let spamData = spamMap.get(sender) || { count: 0, lastMsg: 0 };
                let now = Date.now();
                if (now - spamData.lastMsg < 5000) {
                    spamData.count++;
                } else {
                    spamData.count = 1;
                }
                spamData.lastMsg = now;
                spamMap.set(sender, spamData);

                if (spamData.count >= 5) {
                    await sock.sendMessage(from, { text: "🚫 Spam Detected! Blocked." });
                    await sock.updateBlockStatus(sender, "block");
                    spamMap.delete(sender);
                    return;
                }
            }

            // ============================================
            // 🎭 4. AUTO REACT & VOICE
            // ============================================
            if (!isGroup && !body.startsWith('.')) {
                const lowerBody = body.toLowerCase();
                
                // Auto React
                if (config.AUTO_REACT) {
                    if (lowerBody.includes('hi') || lowerBody.includes('hello')) {
                        await sock.sendMessage(from, { react: { text: "👋", key: mek.key } });
                    } else if (lowerBody.includes('love')) {
                        await sock.sendMessage(from, { react: { text: "❤️", key: mek.key } });
                    }
                }

                // Auto Voice
                if (config.AUTO_VOICE) {
                    for (let key in config.VOICE_MAP) {
                        if (lowerBody === key) {
                            await sock.sendMessage(from, { 
                                audio: { url: config.VOICE_MAP[key] }, 
                                mimetype: 'audio/mpeg', 
                                ptt: true 
                            }, { quoted: mek });
                        }
                    }
                }
            }

            // ============================================
            // ⚙️ 5. COMMAND HANDLER
            // ============================================
            if (body.startsWith('.')) {
                const commandName = body.slice(1).trim().split(" ")[0].toLowerCase();
                const q = body.slice(1).trim().split(" ").slice(1).join(" ");
                const command = commands.find((cmd) => cmd.pattern.test(commandName));
                if (command) {
                    await command.function(sock, mek, m, {
                        from, q, isGroup, sender, reply: (text) => sock.sendMessage(from, { text }, { quoted: mek }), isOwner
                    });
                }
            }

        } catch (err) {
            console.log(err);
        }
    });
}

startBot();
