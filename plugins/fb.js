const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "fb",
    alias: ["facebook"],
    desc: "Download Facebook Video",
    category: "download",
    react: "📘"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please give me a Facebook Video URL. (Ex: .fb https://www.facebook.com/...)");
        if (!q.includes("facebook.com") && !q.includes("fb.watch")) return reply("Invalid Facebook URL.");

        reply("Downloading Video... ⬇️");

        // 1. API එක හරහා වීඩියෝ එකේ දත්ත ලබාගැනීම
        // (මේ API එකෙන් HD සහ SD ලින්ක් දෙකම දෙනවා)
        const response = await axios.get(`https://api.dark-yasiya.xyz/api/facebook?url=${q}`);
        const data = response.data;

        if (!data || !data.result) return reply("Error fetching video. Please check the link or privacy settings.");

        const videoInfo = data.result;
        
        let desc = `*📘 FACEBOOK DOWNLOADER 📘*\n\n`;
        desc += `📃 *Title:* ${videoInfo.title || "FB Video"}\n`;
        desc += `👤 *Author:* ${videoInfo.author || "Unknown"}\n\n`;
        desc += `> © Powered by NEXT Bot`;

        // 2. HD වීඩියෝ එක තිබේ නම් එය යැවීම, නැත්නම් SD යැවීම
        const videoUrl = videoInfo.hd || videoInfo.sd;

        await conn.sendMessage(from, { 
            video: { url: videoUrl }, 
            caption: desc 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error downloading video. (Link might be private or API blocked)");
    }
});