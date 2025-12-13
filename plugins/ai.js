const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ai",
    desc: "Chat with AI",
    category: "main",
    react: "🤖"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("කරුණාකර ප්‍රශ්නයක් අහන්න. (Ex: .ai Who is President of Sri Lanka?)");

        // "Thinking..." message එක යවනවා
        await conn.sendMessage(from, { text: "🤖 Thinking..." }, { quoted: mek });

        // === Working API (Hercai AI) ===
        // මේ ලින්ක් එක දැනට හොදට වැඩ කරන එකක්
        const url = `https://hercai.onrender.com/v3/hercai?question=${q}`;
        
        const response = await axios.get(url);
        const aiReply = response.data.reply;

        // උත්තරේ යවනවා
        return reply(aiReply);

    } catch (e) {
        console.log(e);
        reply("Error fetching AI response. (API might be down)");
    }
});