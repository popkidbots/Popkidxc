'use strict';
const commandHandler = require('../handlers/commandHandler');
const formatter = require('../utils/formatter');
const config = require('../../config');

module.exports = {
    name: 'menu',
    description: 'Show all available commands',
    category: 'General',
    usage: 'menu',
    aliases: ['help', 'commands', 'cmds'],
    
    async execute(sock, message, args) {
        const commands = commandHandler.getAllCommands();
        const menuText = formatter.formatCommandList(commands, config.PREFIX, config.BOT_NAME);
        
        await sock.sendMessage(message.key.remoteJid, {
            text: menuText
        });
    }
};
