'use strict';
const formatter = require('../utils/formatter');

module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    category: 'General',
    usage: 'ping',
    aliases: ['pong', 'speed'],
    
    async execute(sock, message, args) {
        const start = Date.now();
        const sentMsg = await sock.sendMessage(message.key.remoteJid, {
            text: '🏓 Pinging...'
        });
        
        const end = Date.now();
        const latency = end - start;
        
        await sock.sendMessage(message.key.remoteJid, {
            text: `🏓 *Pong!*\n\n⏱️ Latency: *${latency}ms*\n📡 Status: *Online*`
        });
    }
};
