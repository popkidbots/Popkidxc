'use strict';
const moment = require('moment');

module.exports = {
    name: 'time',
    description: 'Show current date and time',
    category: 'Utility',
    usage: 'time [timezone]',
    aliases: ['date', 'now', 'datetime'],
    
    async execute(sock, message, args) {
        const timezone = args[0] || 'UTC';
        const now = moment();
        
        const info = {
            '🕐 Time': now.format('HH:mm:ss'),
            '📅 Date': now.format('DD/MM/YYYY'),
            '🌍 Timezone': timezone,
            '📆 Weekday': now.format('dddd'),
            '📊 Timestamp': now.unix()
        };
        
        await sock.sendMessage(message.key.remoteJid, {
            text: `📅 *CURRENT TIME*\n\n${Object.entries(info).map(([k, v]) => `${k}: ${v}`).join('\n')}`
        });
    }
};
