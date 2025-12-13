const { cmd, commands } = require('../command');

cmd({
    pattern: "menu",
    desc: "Get Bot Commands List",
    category: "main",
    react: "📂"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // බොට්ගේ නම සහ විස්තර
        let botName = "NEXT BOT MD"; // ඔයාගේ බොට්ගේ නම මෙතනට දාන්න
        
        // Menu එකේ උඩින්ම පෙනෙන ලස්සන Design එක
        let menu = `
👋 *Hello User!${botName}* 🤖 *Bot Owner:* Mr.Rasintha
🧬 *Version:* 1.0.0
⚡ *Uptime:* Online

📋 *COMMAND LIST*
-------------------------
`;

        // Commands ටික Loop කරලා Menu එකට එකතු කරන කොටස
        // (මේකෙන් ඔයා අලුතෙන් command එකක් දැම්මම auto මේකට ඇඩ් වෙනවා)
        let addedCommands = [];
        commands.map((command) => {
            if (!addedCommands.includes(command.pattern)) {
                menu += `✨ .${command.pattern}\n`; // උදා: .song
                addedCommands.push(command.pattern);
            }
        });

        menu += `
-------------------------
© Powered by Next Bot
`;

        // Menu එක Photo එකක් එක්ක යවන විදිය
        await conn.sendMessage(from, { 
            image: { url: "https://m.media-amazon.com/images/I/51Q33uZVByL.jpg" }, // මෙතනට ඔයා කැමති ෆොටෝ එකක Link එකක් දාන්න
            caption: menu 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error loading menu.");
    }
});