const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "movie",
    alias: ["sinhalasub", "film"],
    desc: "Download movies from Sinhalasub.lk",
    category: "download",
    react: "🎬"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please type the movie name. (Ex: .movie spiderman)");

        // 1. Sinhalasub.lk Search කිරීම
        const searchUrl = `https://sinhalasub.lk/?s=${q}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        // පළමු ප්‍රතිඵලය තෝරාගැනීම
        const firstMovie = $('div.result-item').first();
        
        if (!firstMovie.length) return reply("Movie not found on Sinhalasub.lk 😕");

        const movieLink = firstMovie.find('a').attr('href');
        const title = firstMovie.find('.title').text().trim();
        const image = firstMovie.find('img').attr('src');
        const rating = firstMovie.find('.rating').text().trim();
        const year = firstMovie.find('.year').text().trim();

        if (!movieLink) return reply("Link fetch error.");

        // 2. Movie පිටුවට යාම
        const moviePage = await axios.get(movieLink);
        const $$ = cheerio.load(moviePage.data);

        // Download Links සොයාගැනීම (Direct Links & PixelDrain)
        let linksText = "";
        
        $$('a.link_button').each((i, el) => {
            const linkName = $$(el).text().trim(); // උදා: 720p (Google Drive)
            const linkUrl = $$(el).attr('href');
            
            // සිංහල සබ් ෆයිල් එක නැතුව Video ලින්ක් විතරක් ගන්නවා
            if (linkUrl && !linkName.includes("Sub")) {
                linksText += `🔗 *${linkName}:* \n${linkUrl}\n\n`;
            }
        });

        // ලින්ක්ස් නැත්නම්
        if (!linksText) linksText = `📥 *Direct Link:* ${movieLink}`;

        // 3. Message එක යැවීම
        let desc = `*🎬 SINHALASUB MOVIE DOWNLOADER 🎬*\n\n`;
        desc += `📌 *Title:* ${title}\n`;
        desc += `📅 *Year:* ${year || "N/A"}\n`;
        desc += `⭐ *Rating:* ${rating || "N/A"}\n`;
        desc += `🌐 *Source:* Sinhalasub.lk\n\n`;
        desc += `───────────────────\n`;
        desc += `*⬇️ DOWNLOAD LINKS:*\n\n`;
        desc += `${linksText}`;
        desc += `───────────────────\n`;
        desc += `> © Powered by NEXT Bot`;

        await conn.sendMessage(from, { 
            image: { url: image }, 
            caption: desc 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error: Your internet connection is blocking the site. Please try using a VPN.");
    }
});