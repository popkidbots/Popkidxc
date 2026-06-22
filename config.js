'use strict';
require('dotenv').config();

module.exports = {
    SESSION_ID: process.env.SESSION_ID || '',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '',
    BOT_NAME: process.env.BOT_NAME || 'NEXUS',
    PREFIX: process.env.PREFIX || '.',
    MEGA_EMAIL: process.env.MEGA_EMAIL || '',
    MEGA_PASSWORD: process.env.MEGA_PASSWORD || '',
    
    // Session Configuration
    SESSION_DIR: './sessions',
    CREDS_PATH: './sessions/creds.json',
    
    // Bot Configuration
    READ_MESSAGES: true,
    AUTO_STATUS_VIEW: false,
    DELETE_MESSAGES: false,
    
    // Command Configuration
    COMMANDS_DIR: './src/commands',
    ALLOWED_GROUPS: [],
    BLOCKED_USERS: [],
    
    // Debug
    DEBUG: true,
};
