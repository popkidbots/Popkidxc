'use strict';
const config = require('../../config');
const formatter = require('../utils/formatter');

module.exports = {
    name: 'owner',
    description: 'Owner-only commands',
    category: 'Owner',
    usage: 'owner <command>',
    aliases: ['admin'],
    ownerOnly: true,
    
    async execute(sock, message, args) {
        const subCommand = args[0]?.toLowerCase();
        
        if (!subCommand) {
            await sock.sendMessage(message.key.remoteJid, {
                text: formatter.formatInfoMessage(
                    'Owner commands:\n' +
                    '• broadcast - Send message to all chats\n' +
                    '• reload - Reload commands\n' +
                    '• status - Show bot status\n' +
                    '• block <number> - Block user\n' +
                    '• unblock <number> - Unblock user'
                )
            });
            return;
        }

        switch (subCommand) {
            case 'reload':
                const commandHandler = require('../handlers/commandHandler');
                commandHandler.reloadCommands();
                await sock.sendMessage(message.key.remoteJid, {
                    text: formatter.formatSuccessMessage('Commands reloaded successfully!')
                });
                break;
                
            case 'status':
                const status = {
                    '🔄 Connected': sock.ws?.readyState === 1 ? '✅ Yes' : '❌ No',
                    '📦 Commands': commandHandler?.getCommandCount() || 0,
                    '👤 User': sock.user?.name || 'Unknown',
                    '📱 Memory': `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                    '⏱️ Uptime': `${Math.floor(process.uptime())}s`
                };
                await sock.sendMessage(message.key.remoteJid, {
                    text: formatter.createList(status, '📊 BOT STATUS')
                });
                break;
                
            default:
                await sock.sendMessage(message.key.remoteJid, {
                    text: formatter.formatErrorMessage(`Unknown owner command: ${subCommand}`)
                });
        }
    }
};
