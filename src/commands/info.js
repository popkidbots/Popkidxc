'use strict';
const config = require('../../config');
const formatter = require('../utils/formatter');
const os = require('os');

module.exports = {
    name: 'info',
    description: 'Show bot information',
    category: 'General',
    usage: 'info',
    aliases: ['about', 'status'],
    
    async execute(sock, message, args) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        const info = {
            '🤖 Bot Name': config.BOT_NAME,
            '👤 User': sock.user?.name || 'Unknown',
            '📱 Phone': sock.user?.id?.split(':')[0] || 'Unknown',
            '⏱️ Uptime': uptimeStr,
            '🔄 Connected': sock.ws?.readyState === 1 ? '✅ Yes' : '❌ No',
            '💻 Node': process.version,
            '🖥️ OS': os.platform(),
            '📦 Commands': commandHandler?.getCommandCount() || 0,
        };
        
        await sock.sendMessage(message.key.remoteJid, {
            text: formatter.createList(info, '📊 BOT INFORMATION')
        });
    }
};
