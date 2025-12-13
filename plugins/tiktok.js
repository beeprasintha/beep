const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["tt"],
    desc: "Download TikTok Video without watermark",
    category: "download",
    react: "🎵"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please give me a TikTok URL. (Ex: .tiktok https://vm.tiktok.com/...)");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok URL.");

        reply("Downloading Video... ⬇️");

        // 1. TikWM API එකෙන් වීඩියෝ එකේ දත්ත ලබාගැනීම
        const response = await axios.get(`https://www.tikwm.com/api/?url=${q}`);
        const data = response.data.data;

        if (!data) return reply("Error fetching video details. Please check the link.");

        // 2. වීඩියෝ එකේ විස්තර සහ Link එක ගැනීම
        const videoUrl = data.play; // Watermark නැති වීඩියෝ ලින්ක් එක
        const cover = data.cover;
        const title = data.title;
        const author = data.author.nickname;
        const views = data.play_count;

        let desc = `*🎬 TIKTOK DOWNLOADER 🎬*\n\n`;
        desc += `👤 *Author:* ${author}\n`;
        desc += `📃 *Title:* ${title}\n`;
        desc += `👀 *Views:* ${views}\n\n`;
        desc += `> © Powered by NEXT Bot`;

        // 3. වීඩියෝ එක යැවීම
        await conn.sendMessage(from, { 
            video: { url: videoUrl }, 
            caption: desc 
        }, { quoted: mek });

        // (Optional) Audio එක විතරක් ඕන නම් මේ කොටස uncomment කරන්න
        // await conn.sendMessage(from, { audio: { url: data.music }, mimetype: 'audio/mpeg' }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error downloading video. (Try again later)");
    }
});