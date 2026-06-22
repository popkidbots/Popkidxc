'use strict';
const chalk = require('chalk');

class Formatter {
    // Box-style formatting for menus
    createBox(title, content, footer = '') {
        const width = 45;
        const topBorder = '╔' + '═'.repeat(width - 2) + '╗';
        const bottomBorder = '╚' + '═'.repeat(width - 2) + '╝';
        
        const lines = [];
        lines.push(topBorder);
        
        // Title
        if (title) {
            const titleLine = '║' + ` ${title} `.padEnd(width - 2, '═') + '║';
            lines.push(titleLine);
        }
        
        // Content
        if (typeof content === 'string') {
            const contentLines = content.split('\n');
            for (const line of contentLines) {
                const padded = '║ ' + line.padEnd(width - 4) + ' ║';
                lines.push(padded);
            }
        } else if (Array.isArray(content)) {
            for (const line of content) {
                const padded = '║ ' + line.padEnd(width - 4) + ' ║';
                lines.push(padded);
            }
        }
        
        // Footer
        if (footer) {
            const footerLine = '║' + ` ${footer} `.padEnd(width - 2, '═') + '║';
            lines.push(footerLine);
        }
        
        lines.push(bottomBorder);
        return lines.join('\n');
    }

    formatCommandList(commands, prefix, botName = 'NEXUS') {
        const header = `🌟 ${botName} COMMAND MENU 🌟`;
        const footer = `ℹ️ Use ${prefix}help <command> for details`;
        
        // Group commands by category
        const categories = {};
        for (const cmd of commands) {
            const category = cmd.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(cmd);
        }

        let content = '';
        for (const [category, cmds] of Object.entries(categories)) {
            content += `\n📂 *${category}*\n`;
            for (const cmd of cmds) {
                const description = cmd.description || 'No description';
                content += `   ${prefix}${cmd.name}`.padEnd(20) + ` - ${description}\n`;
            }
        }

        return this.createBox(header, content, footer);
    }

    formatHelp(command, prefix) {
        const lines = [];
        lines.push(`📋 *${command.name.toUpperCase()}*`);
        lines.push('');
        lines.push(`📝 *Description:* ${command.description || 'No description'}`);
        if (command.usage) {
            lines.push(`💡 *Usage:* ${prefix}${command.usage}`);
        }
        if (command.aliases && command.aliases.length > 0) {
            lines.push(`🔗 *Aliases:* ${command.aliases.join(', ')}`);
        }
        if (command.example) {
            lines.push(`📌 *Example:* ${prefix}${command.example}`);
        }
        lines.push(`👤 *Owner Only:* ${command.ownerOnly ? 'Yes' : 'No'}`);
        return this.createBox('🔍 COMMAND HELP', lines);
    }

    formatSuccessMessage(message) {
        return `✅ *Success!*\n\n${message}`;
    }

    formatErrorMessage(message) {
        return `❌ *Error!*\n\n${message}`;
    }

    formatInfoMessage(message) {
        return `ℹ️ *Info*\n\n${message}`;
    }

    createList(items, title = '') {
        let result = title ? `📋 *${title}*\n\n` : '';
        for (const [key, value] of Object.entries(items)) {
            result += `• *${key}:* ${value}\n`;
        }
        return result;
    }

    createProgressBar(percentage, length = 20) {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
}

module.exports = new Formatter();
