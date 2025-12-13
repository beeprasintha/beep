const { cmd } = require('../command');

cmd({
    pattern: "logo",
    desc: "Generate AI Logo",
    category: "ai",
    react: "🎨"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please give me a name for the logo. (Ex: .logo Knight Bot)");

        reply("Generating Logo... Please wait! 🔄");

        // AI Logo එක සාදන Link එක (Prompt එක ලස්සනට හදමු)
        const prompt = `A professional, premium, 3D neon glowing logo for the name "${q}", dark background, high quality, 4k`;
        const logoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        await conn.sendMessage(from, { 
            image: { url: logoUrl }, 
            caption: `🎨 *AI LOGO GENERATED*\n\nName: ${q}\n\n> © Powered by Knight Bot` 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error generating logo.");
    }
});