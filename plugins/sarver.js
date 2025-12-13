const { cmd } = require('../command');

cmd({
    pattern: "save",
    desc: "Save Whatsapp Status",
    category: "owner",
    react: "💾"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // මේක වැඩ කරන්නේ අපි Status එකකට Reply කරලා .save ගැහුවොත් විතරයි
        const quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
        if (!quoted) return reply("Status එකකට Reply කරලා .save ගහන්න.");

        // Status එක Image එකක්ද Video එකක්ද බලනවා
        if (quoted.imageMessage) {
            await conn.sendMessage(from, { 
                image: quoted.imageMessage, 
                caption: "Status Saved! ✅" 
            });
        } else if (quoted.videoMessage) {
            await conn.sendMessage(from, { 
                video: quoted.videoMessage, 
                caption: "Status Saved! ✅" 
            });
        } else {
            reply("මේක Save කරන්න බැරි ජාතියේ Status එකක්.");
        }

    } catch (e) {
        console.log(e);
        reply("Error saving status.");
    }
});