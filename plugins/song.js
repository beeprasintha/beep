// plugins/song.js
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "song",
    desc: "Download songs",
    category: "download",
    react: "🎵"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please type the song name! (Ex: .song Manike mage hithe)");

        const search = await yts(q);
        const data = search.videos[0];
        const url = data.url;

        let desc = `*🎼 SONG DOWNLOADER*\n\nTitle: ${data.title}\nTime: ${data.timestamp}\n\nDownloading...`;
        
        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

        // API Request
        let downRes = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${url}`);
        let songUrl = downRes.data.result.download_url;

        await conn.sendMessage(from, { 
            audio: { url: songUrl }, 
            mimetype: 'audio/mpeg',
            fileName: data.title + ".mp3"
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error downloading the song.");
    }
});