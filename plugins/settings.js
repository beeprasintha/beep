const { cmd } = require('../command');

cmd({
    pattern: "autostatus",
    desc: "Turn Auto Status Save ON or OFF",
    category: "owner",
    react: "⚙️"
},
async (conn, mek, m, { from, q, reply, isOwner }) => {
    // 1. මේක Owner ට විතරක් කරන්න පුළුවන් වැඩක්
    // (ඔයාගේ නම්බර් එක index.js එකේ owner check එකට දාලා තියෙන්න ඕනේ)
    /* if (!isOwner) return reply("This command is for Owner only!"); */ 
    // දැනට owner check එක comment කරලා තියෙන්නේ, ඕන නම් active කරගන්න.

    if (!q) return reply("Please use: *.autostatus on* or *.autostatus off*");

    const status = q.toLowerCase();

    if (status === 'on') {
        global.autoStatus = true;
        reply("✅ **Auto Status Save turned ON!** \n(දැන් අලුත් Status Inbox එකට එයි).");
    } else if (status === 'off') {
        global.autoStatus = false;
        reply("❌ **Auto Status Save turned OFF!** \n(Status ඒම නතර විය).");
    } else {
        reply("Wrong command! Use *.autostatus on* or *.autostatus off*");
    }
});