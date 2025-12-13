const { cmd } = require('../command');

cmd({
    pattern: "style",
    alias: ["fancy"],
    desc: "Change text style",
    category: "convert",
    react: "✍️"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please give me some text. (Ex: .style Knight Bot)");

        // අකුරු මාරු කරන Logic එක
        const styles = {
            "bold": q.replace(/[a-zA-Z0-9]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.match(/[a-z]/) ? 119789 : c.match(/[A-Z]/) ? 119737 : 120764))),
            "italic": q.replace(/[a-zA-Z0-9]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.match(/[a-z]/) ? 119841 : c.match(/[A-Z]/) ? 119789 : 0))),
            "monospace": "```" + q + "```"
        };

        let msg = `*🎨 FANCY TEXT GENERATOR 🎨*\n\n`;
        msg += `1️⃣ *Bold:* ${styles.bold}\n\n`;
        msg += `2️⃣ *Italic:* ${styles.italic}\n\n`;
        msg += `3️⃣ *Mono:* ${styles.monospace}\n\n`;
        msg += `> © Powered by NEXT Bot`;

        await conn.sendMessage(from, { text: msg }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error converting text.");
    }
});