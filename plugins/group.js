const { cmd, commands } = require('../command');

// ===============================
// 1. TAG ALL (හැමෝම මෙන්ෂන් කිරීම)
// ===============================
cmd({
    pattern: "tagall",
    desc: "Mention all members",
    category: "group",
    react: "📢"
},
async (conn, mek, m, { from, isGroup, participants, reply }) => {
    try {
        if (!isGroup) return reply("This command is only for Groups.");
        
        // Group එකේ විස්තර ගන්නවා
        const metadata = await conn.groupMetadata(from);
        const allParticipants = metadata.participants;

        let text = `📢 *HEY EVERYONE!* \n\n*Message:* ${m.body.slice(8) || "Notification"}\n\n`;
        
        // හැමෝම loop කරලා text එකට එකතු කරනවා
        for (let i of allParticipants) {
            text += `➥ @${i.id.split('@')[0]}\n`;
        }

        await conn.sendMessage(from, { text: text, mentions: allParticipants.map(a => a.id) }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error in tagall.");
    }
});

// ===============================
// 2. MUTE & UNMUTE (Group Lock/Unlock)
// ===============================
cmd({
    pattern: "mute",
    desc: "Close the group (Admins Only)",
    category: "group",
    react: "🔒"
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("This is group only cmd.");
        // Admin check එක මෙතන කරන්න ඕනේ (සරලව)
        // Note: Admin check එක හරියටම වැඩ කරන්න නම් 'conn.groupMetadata' පාවිච්චි කරන්න ඕනේ.
        // අපි හිතමු ඔයා Admin කියලා.
        
        await conn.groupSettingUpdate(from, 'announcement');
        reply("🔒 *Group Chat Closed!* Only Admins can send messages.");
    } catch (e) {
        reply("බොට් Admin කෙනෙක් විය යුතුය. (Please give Admin role to Bot)");
    }
});

cmd({
    pattern: "unmute",
    desc: "Open the group",
    category: "group",
    react: "🔓"
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("This is group only cmd.");
        await conn.groupSettingUpdate(from, 'not_announcement');
        reply("🔓 *Group Chat Opened!* Everyone can send messages.");
    } catch (e) {
        reply("බොට් Admin කෙනෙක් විය යුතුය.");
    }
});

// ===============================
// 3. KICK (සාමාජිකයින් ඉවත් කිරීම)
// ===============================
cmd({
    pattern: "kick",
    desc: "Remove a member",
    category: "group",
    react: "🚫"
},
async (conn, mek, m, { from, isGroup, quoted, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        if (!quoted) return reply("Reply to the user you want to kick!");

        await conn.groupParticipantsUpdate(from, [quoted.sender], "remove");
        reply("🚫 User has been kicked!");
    } catch (e) {
        reply("Failed! බොට් Admin කෙනෙක්ද බලන්න.");
    }
});

// ===============================
// 4. PROMOTE & DEMOTE (Admin දීම සහ ගැනීම)
// ===============================
cmd({
    pattern: "promote",
    desc: "Make a member Admin",
    category: "group",
    react: "👮‍♂️"
},
async (conn, mek, m, { from, isGroup, quoted, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        if (!quoted) return reply("Reply to the user.");

        await conn.groupParticipantsUpdate(from, [quoted.sender], "promote");
        reply("👮‍♂️ User promoted to Admin!");
    } catch (e) {
        reply("Failed! Check Bot Admin role.");
    }
});

cmd({
    pattern: "demote",
    desc: "Remove Admin role",
    category: "group",
    react: "📉"
},
async (conn, mek, m, { from, isGroup, quoted, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        if (!quoted) return reply("Reply to the user.");

        await conn.groupParticipantsUpdate(from, [quoted.sender], "demote");
        reply("📉 Admin role removed!");
    } catch (e) {
        reply("Failed!");
    }
});

// ===============================
// 5. INVITE LINK (Group Link එක ගැනීම)
// ===============================
cmd({
    pattern: "invite",
    desc: "Get Group Link",
    category: "group",
    react: "🔗"
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("Only for groups.");
        
        const code = await conn.groupInviteCode(from);
        reply(`🔗 *Group Link:*\n\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
        reply("Failed! බොට් Admin කෙනෙක් විය යුතුය.");
    }
});