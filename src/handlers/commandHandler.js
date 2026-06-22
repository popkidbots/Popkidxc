'use strict';
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const logger = require('../utils/logger');
const formatter = require('../utils/formatter');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
        this.loadCommands();
    }

    loadCommands() {
        const commandPath = path.join(__dirname, '../commands');
        if (!fs.existsSync(commandPath)) {
            fs.mkdirSync(commandPath, { recursive: true });
            return;
        }

        const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const command = require(path.join(commandPath, file));
                if (command.name) {
                    this.commands.set(command.name, command);
                    if (command.aliases) {
                        for (const alias of command.aliases) {
                            this.aliases.set(alias, command.name);
                        }
                    }
                    logger.info(`✅ Loaded command: ${command.name}`);
                }
            } catch (error) {
                logger.error(`❌ Failed to load command ${file}:`, error.message);
            }
        }

        logger.info(`📊 Loaded ${this.commands.size} commands`);
    }

    getCommand(name) {
        const commandName = this.aliases.get(name) || name;
        return this.commands.get(commandName);
    }

    getAllCommands() {
        return Array.from(this.commands.values());
    }

    getCommandCount() {
        return this.commands.size;
    }

    async executeCommand(sock, message, commandName, args) {
        const command = this.getCommand(commandName);
        if (!command) return null;

        try {
            // Check if command is owner only
            if (command.ownerOnly) {
                const sender = message.key.remoteJid;
                const ownerNumber = config.OWNER_NUMBER;
                if (sender !== `${ownerNumber}@s.whatsapp.net`) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: formatter.errorMessage('This command is owner-only!')
                    });
                    return null;
                }
            }

            // Execute command
            const result = await command.execute(sock, message, args);
            return result;
        } catch (error) {
            logger.error(`Error executing command ${commandName}:`, error);
            await sock.sendMessage(message.key.remoteJid, {
                text: formatter.errorMessage(`Error: ${error.message}`)
            });
            return null;
        }
    }

    reloadCommands() {
        // Clear require cache
        const commandPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            delete require.cache[require.resolve(path.join(commandPath, file))];
        }

        this.commands.clear();
        this.aliases.clear();
        this.loadCommands();
        logger.info('🔄 Commands reloaded');
    }
}

module.exports = new CommandHandler();
