'use strict';
const formatter = require('../utils/formatter');

module.exports = {
    name: 'commandname',           // Command name
    description: 'Command description',
    category: 'General',           // Category for menu
    usage: 'command <arg>',        // Usage format
    aliases: ['alias1', 'alias2'], // Alternative names
    ownerOnly: false,             // Owner-only command?
    
    async execute(sock, message, args) {
        // Command logic here
        const chatId = message.key.remoteJid;
        
        // Send response
        await sock.sendMessage(chatId, {
            text: 'Command executed successfully!'
        });
    }
};
