'use strict';
const config = require('../../config');
const commandHandler = require('./commandHandler');
const logger = require('../utils/logger');
const formatter = require('../utils/formatter');

class MessageHandler {
    async handleMessage(sock, message) {
        try {
            // Skip if no message content
            if (!message.message) return;

            const chatId = message.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            const isOwner = message.key.remoteJid === `${config.OWNER_NUMBER}@s.whatsapp.net`;

            // Get message text
            let text = '';
            if (message.message.conversation) {
                text = message.message.conversation;
            } else if (message.message.extendedTextMessage?.text) {
                text = message.message.extendedTextMessage.text;
            } else {
                return;
            }

            // Check if message starts with prefix
            const prefix = config.PREFIX;
            if (!text.startsWith(prefix)) {
                // Auto-status view
                if (config.AUTO_STATUS_VIEW && message.message?.protocolMessage?.type === 'PROTOCOL_MESSAGE_STATUS') {
                    // Handle status views if needed
                }
                return;
            }

            // Parse command
            const args = text.slice(prefix.length).trim().split(/\s+/);
            const commandName = args.shift().toLowerCase();

            // Execute command
            await commandHandler.executeCommand(sock, message, commandName, args);

        } catch (error) {
            logger.error('Error handling message:', error);
        }
    }
}

module.exports = new MessageHandler();
