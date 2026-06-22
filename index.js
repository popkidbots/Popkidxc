'use strict';
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { loadSession } = require('./src/utils/sessionLoader');
const messageHandler = require('./src/handlers/messageHandler');
const commandHandler = require('./src/handlers/commandHandler');
const logger = require('./src/utils/logger');
const config = require('./config');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const { Boom } = require('@hapi/boom');

class NexusBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.commandHandler = commandHandler;
        this.messageHandler = messageHandler;
        this.config = config;
        this.logger = logger;
        
        // Load commands on startup
        this.commandHandler.loadCommands();
        
        this.startBot();
    }

    async startBot() {
        this.logger.info(chalk.cyan('═══════════════════════════════'));
        this.logger.info(chalk.green('    🌟 NEXUS BOT STARTING 🌟'));
        this.logger.info(chalk.cyan('═══════════════════════════════'));
        this.logger.info(chalk.yellow('    📱 WhatsApp Bot v1.0'));
        this.logger.info(chalk.yellow(`    🤖 Bot Name: ${this.config.BOT_NAME}`));
        this.logger.info(chalk.yellow(`    🔗 Commands: ${this.commandHandler.getCommandCount()}`));
        this.logger.info(chalk.cyan('═══════════════════════════════'));

        // Ensure session directory exists
        if (!require('fs').existsSync(this.config.SESSION_DIR)) {
            require('fs').mkdirSync(this.config.SESSION_DIR, { recursive: true });
        }

        // Load session from MEGA
        await this.loadSession();

        // Initialize WhatsApp connection
        await this.initializeSocket();
    }

    async loadSession() {
        const sessionId = this.config.SESSION_ID;
        const sessionDir = this.config.SESSION_DIR;

        if (!sessionId) {
            this.logger.warn(chalk.yellow('⚠️  No SESSION_ID found in environment variables'));
            this.logger.info(chalk.cyan('📱 Using QR code authentication...'));
            return;
        }

        this.logger.info(chalk.cyan('📥 Loading session from MEGA...'));
        const success = await loadSession(sessionId, sessionDir);
        
        if (success) {
            this.logger.info(chalk.green('✅ Session loaded successfully!'));
        } else {
            this.logger.warn(chalk.yellow('⚠️  Failed to load session, using QR auth'));
        }
    }

    async initializeSocket() {
        const { state, saveCreds } = await useMultiFileAuthState(this.config.SESSION_DIR);

        this.sock = makeWASocket({
            logger: this.logger,
            auth: state,
            printQRInTerminal: true,
            browser: ['NEXUS WhatsApp Bot', 'Chrome', '1.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
        });

        // Handle connection events
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.logger.info(chalk.cyan('📱 Scan QR Code to login:'));
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'connecting') {
                this.logger.info(chalk.yellow('🔄 Connecting to WhatsApp...'));
            }

            if (connection === 'open') {
                this.isConnected = true;
                this.logger.info(chalk.green('✅ Connected to WhatsApp!'));
                this.logger.info(chalk.green(`👤 Logged in as: ${this.sock.user?.name || 'Unknown'}`));
                
                // Send startup notification
                await this.sendStartupNotification();
            }

            if (connection === 'close') {
                this.isConnected = false;
                const statusCode = (lastDisconnect?.error)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                this.logger.warn(chalk.yellow(`⚠️ Connection closed: ${statusCode}`));
                
                if (shouldReconnect) {
                    this.logger.info(chalk.cyan('🔄 Reconnecting...'));
                    setTimeout(() => this.initializeSocket(), 3000);
                } else {
                    this.logger.error(chalk.red('❌ Logged out, please restart with new session'));
                }
            }
        });

        // Handle credentials update
        this.sock.ev.on('creds.update', saveCreds);

        // Handle messages
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (msg.key?.fromMe || !msg.message) continue;
                await this.messageHandler.handleMessage(this.sock, msg);
            }
        });

        // Handle errors
        this.sock.ev.on('error', (error) => {
            this.logger.error(chalk.red('❌ Socket error:', error));
        });
    }

    async sendStartupNotification() {
        try {
            const owner = this.config.OWNER_NUMBER;
            if (owner) {
                const jid = `${owner}@s.whatsapp.net`;
                await this.sock.sendMessage(jid, {
                    text: `
🌟 *${this.config.BOT_NAME} BOT ONLINE* 🌟
━━━━━━━━━━━━━━━━━━━━━
✅ Status: Connected
👤 User: ${this.sock.user?.name || 'Unknown'}
📅 Started: ${new Date().toLocaleString()}
🔗 Commands: ${this.commandHandler.getCommandCount()}
━━━━━━━━━━━━━━━━━━━━━
Type *${this.config.PREFIX}menu* to see commands
                    `.trim()
                });
            }
        } catch (error) {
            // Silently fail
        }
    }
}

// Start the bot
new NexusBot();

// Handle process events
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Bot stopped by user'));
    process.exit(0);
});
