const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

cmd({
    pattern: "removebg",
    alias: ["rmbg"],
    desc: "Remove image background",
    category: "edit",
    react: "✂️"
},
async (conn, mek, m, { from, reply }) => {
    try {
        let buffer;
        const type = Object.keys(mek.message)[0];
        
        // 1. Quoted Image (Reply කරපු ෆොටෝ එකක්ද?)
        const quoted = type === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo ? mek.message.extendedTextMessage.contextInfo.quotedMessage : null;
        
        if (quoted && quoted.imageMessage) {
            // Reply කරපු ෆොටෝ එක Download කිරීම
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let bufferArray = [];
            for await (const chunk of stream) bufferArray.push(chunk);
            buffer = Buffer.concat(bufferArray);
        } 
        // 2. Direct Image (කෙලින්ම එවපු ෆොටෝ එකක්ද?)
        else if (mek.message.imageMessage) {
            const stream = await downloadContentFromMessage(mek.message.imageMessage, 'image');
            let bufferArray = [];
            for await (const chunk of stream) bufferArray.push(chunk);
            buffer = Buffer.concat(bufferArray);
        } else {
            return reply("කරුණාකර Photo එකකට Reply කරන්න හෝ Photo එකක් සමග .removebg ලෙස type කරන්න.");
        }

        reply("Removing Background... ✂️");

        // 3. Remove.bg API එකට යැවීම
        const formData = new FormData();
        formData.append('image_file', buffer, 'image.jpg');
        formData.append('size', 'auto');

        // ⚠️ පහල තියෙන "YOUR_API_KEY_HERE" කියන තැනට ඔයාගේ remove.bg API Key එක දාන්න අමතක කරන්න එපා!
        const apiKey = "NuX1dg5EX4ryEotE7VLQxSaQ"; 

        const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': apiKey,
            },
            responseType: 'arraybuffer'
        });

        // 4. සංස්කරණය කල ෆොටෝ එක යැවීම
        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: "✂️ *Background Removed!*" 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error! API Key එක නිවැරදිද බලන්න. (remove.bg එකෙන් key එකක් අරන් දාන්න).");
    }
});