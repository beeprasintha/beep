const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { commands } = require('./command');
const config = require('./config');
global.autoStatus = config.AUTO_STATUS_SAVE;

// Spam කරන අයව තාවකාලිකව මතක තියාගන්න මැප් එක
const spamMap = new Map();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  // ... මුල හරිය එහෙමම තියන්න ...

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    // 👇 මෙතන ඔයාගේ නම්බර් එක දාන්න (QR වෙනුවට Code එක එන්න)
    const usePairingCode = true;
    const phoneNumber = "94771916428"; // උදා: 94771234567

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !usePairingCode, // Pairing Code නම් QR එපා
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"] // Render එකට ගැලපෙන Browser එක
    });

    // 👇 මේ කෑල්ලෙන් තමයි Code එක එවලන්නේ
    if (usePairingCode && !sock.authState.creds.registered) {
        console.log("Pairing code ඉල්ලමින් පවතී... ⏳");
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n\n🟢 YOUR PAIRING CODE: ${code}\n\n`);
            } catch (e) {
                console.log("Code Error:", e);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // ... පහළ කෑලි එහෙමම තියන්න (connection update කොටස) ...

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('Scan this QR Code:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
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

            // =============================================
            // 1. මූලික විචල්‍යයන් (Variables) මෙතනම සාදාගැනීම
            // =============================================
           const type = getContentType(mek.message);
const body = (type === 'conversation') ? mek.message.conversation : 
             (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
             (type === 'imageMessage') ? mek.message.imageMessage.caption :
             (type === 'videoMessage') ? mek.message.videoMessage.caption : '';

            const from = mek.key.remoteJid;
            const sender = mek.key.participant || mek.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // =============================================
            // 2. INBOX SPAM PROTECTION (ප්‍රධාන කොටස)
            // =============================================
            const isOwner = sender.includes('94771916428'); // ⚠️ මෙතන ඔයාගේ නම්බර් එක දාන්න!

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

                if (spamData.count >= 4) {
                    await sock.sendMessage(from, { text: "🚫 *Spam Detected!* You are blocked automatically." });
                    await sock.updateBlockStatus(sender, "block");
                    spamMap.delete(sender);
                    return;
                }
            }

            // =============================================
            // 3. COMMANDS RUN කරන කොටස
            // =============================================
            if (!body.startsWith('.')) return;

            const commandName = body.slice(1).trim().split(" ")[0].toLowerCase();
            const q = body.slice(1).trim().split(" ").slice(1).join(" ");

            // ============================================
            //              🎭 FUN FEATURES
            // ============================================
            const config = require('./config'); // Config එක import කරගැනීම

            // 1. AUTO STATUS VIEW (Status බැලීම)
            if (config.AUTO_STATUS_VIEW && mek.key.remoteJid === 'status@broadcast') {
                await sock.readMessages([mek.key]);
            }

            // 2. AUTO REACT & VOICE (Commands නොවන මැසේජ් සඳහා)
            if (!isGroup && !body.startsWith('.')) { // Group වල නැතුව Inbox විතරක් වැඩ කරන්න හදමු
                
                const lowerBody = body.toLowerCase();

                // --- Auto React ---
                if (config.AUTO_REACT) {
                    if (lowerBody.includes('hi') || lowerBody.includes('hello')) {
                        await sock.sendMessage(from, { react: { text: "👋", key: mek.key } });
                    } else if (lowerBody.includes('love')) {
                        await sock.sendMessage(from, { react: { text: "❤️", key: mek.key } });
                    }
                }

                // --- Auto Voice ---
                if (config.AUTO_VOICE) {
                    // Config එකේ තියෙන වචන ලිස්ට් එක පරීක්ෂා කිරීම
                    for (let key in config.VOICE_MAP) {
                        if (lowerBody === key) {
                            await sock.sendMessage(from, { 
                                audio: { url: config.VOICE_MAP[key] }, 
                                mimetype: 'audio/mpeg', 
                                ptt: true // Voice Note එකක් වගේ යවන්න
                            }, { quoted: mek });
                        }
                    }
                }
            }
            // ============================================
            //          📥 AUTO STATUS SAVER (UPDATED)
            // ============================================
            
            if (mek.key.remoteJid === 'status@broadcast') {
                if (config.AUTO_STATUS_VIEW) {
                    await sock.readMessages([mek.key]);
                }

                // 👇 වෙනස් කරපු පේළිය මෙන්න
                if (global.autoStatus) { 
                    
                    const user = mek.key.participant; 
                    const caption = mek.message.imageMessage?.caption || mek.message.videoMessage?.caption || "";
                    const ownerNumber = '94771916428@s.whatsapp.net'; // ඔයාගේ නම්බර් එක

                    if (mek.message.imageMessage) {
                        let imageBuffer = await sock.downloadMediaMessage(mek, 'image');
                        await sock.sendMessage(ownerNumber, { image: imageBuffer, caption: caption });
                    }
                    else if (mek.message.videoMessage) {
                        let videoBuffer = await sock.downloadMediaMessage(mek, 'video');
                        await sock.sendMessage(ownerNumber, { video: videoBuffer, caption: caption });
                    }
                }
            }

            const command = commands.find((cmd) => cmd.pattern.test(commandName));

            if (command) {
                await command.function(sock, mek, m, {
                    from,
                    q,
                    isGroup,
                    sender,
                    reply: (text) => sock.sendMessage(from, { text }, { quoted: mek })
                });
            }

        } catch (err) {
            console.log(err);
        }
    });
}


startBot();
