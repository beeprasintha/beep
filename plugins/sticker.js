const { cmd } = require('../command');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "sticker",
    alias: ["s"],
    desc: "Convert photo to sticker",
    category: "convert",
    react: "🃏"
},
async (conn, mek, m, { from, reply }) => {
    try {
        let buffer;
        
        // මැසේජ් වර්ගය (Type) හොයාගැනීම
        const type = Object.keys(mek.message)[0];
        
        // 1. මේක Reply කරපු Photo එකක්ද?
        // (අපි බලනවා reply එකක් තියෙනවද සහ ඒක ඇතුලේ imageMessage එකක් තියෙනවද කියලා)
        const quoted = type === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo ? mek.message.extendedTextMessage.contextInfo.quotedMessage : null;
        
        if (quoted && quoted.imageMessage) {
            // Reply කරපු ෆොටෝ එක Download කිරීම
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let bufferArray = [];
            for await (const chunk of stream) {
                bufferArray.push(chunk);
            }
            buffer = Buffer.concat(bufferArray);
        } 
        // 2. නැත්නම් මේක ෆොටෝ එකක් එක්කම එවපු මැසේජ් එකක්ද? (.sticker caption එකත් එක්ක)
        else if (mek.message.imageMessage) {
            const stream = await downloadContentFromMessage(mek.message.imageMessage, 'image');
            let bufferArray = [];
            for await (const chunk of stream) {
                bufferArray.push(chunk);
            }
            buffer = Buffer.concat(bufferArray);
        } else {
            return reply("කරුණාකර Photo එකකට Reply කරන්න හෝ Photo එකක් සමග .sticker ලෙස type කරන්න.");
        }

        // Sticker එක හදන බව දැනුම් දීම
        // reply("Creating Sticker... 🔄"); 
        // (ඕන නම් මේක uncomment කරන්න, හැබැයි ස්ටිකර් එක එන්න ටිකක් වෙලා යන නිසා මම මේක අයින් කරා)

        // Sticker එක සාදන කොටස
        let sticker = new Sticker(buffer, {
            pack: 'Knight Bot Stickers', 
            author: 'Knight Bot', 
            type: StickerTypes.FULL, 
            categories: ['🤩', '🎉'], 
            id: '12345',
            quality: 50, 
            background: 'transparent' 
        });

        const stickerBuffer = await sticker.toBuffer();
        
        // Sticker එක යැවීම
        await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error creating sticker! (Try again)");
    }
});