'use strict';
const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const logger = require('./logger');
const chalk = require('chalk');

/**
 * sessionLoader — Restores creds.json from MEGA using NEXUS___ session format
 * Format: SESSION_ID = "NEXUS___<mega_file_key>__<fingerprint>"
 */
async function loadSession(sessionId, sessionDir) {
    const credsPath = path.join(sessionDir, 'creds.json');

    if (fs.existsSync(credsPath)) {
        logger.info(chalk.green('[ ✅ ] Session already exists, skipping download.'));
        return true;
    }

    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    if (!sessionId || !sessionId.startsWith('NEXUS___')) {
        logger.warn(chalk.yellow('[ ⚠️ ] Invalid SESSION_ID — must start with NEXUS___'));
        logger.info(chalk.cyan('[ ℹ️ ] Using QR code authentication...'));
        return false;
    }

    const withoutPrefix = sessionId.replace('NEXUS___', '').trim();
    const megaKey = withoutPrefix.split('__')[0];

    if (!megaKey) {
        logger.warn(chalk.yellow('[ ⚠️ ] SESSION_ID is empty after prefix strip.'));
        return false;
    }

    logger.info(chalk.cyan('[ 📥 ] Downloading session from MEGA...'));

    return new Promise((resolve) => {
        try {
            const filer = File.fromURL(`https://mega.nz/file/${megaKey}`);

            filer.loadAttributes((attrErr) => {
                if (attrErr) {
                    logger.error(chalk.red('[ ❌ ] MEGA attribute load failed:'), attrErr.message);
                    return resolve(false);
                }

                logger.info(chalk.cyan('[ 📦 ] Downloading file...'));

                filer.download((err, data) => {
                    if (err) {
                        logger.error(chalk.red('[ ❌ ] MEGA download failed:'), err.message);
                        return resolve(false);
                    }

                    fs.writeFile(credsPath, data, (writeErr) => {
                        if (writeErr) {
                            logger.error(chalk.red('[ ❌ ] Failed to write creds.json:'), writeErr.message);
                            return resolve(false);
                        }
                        logger.info(chalk.green('[ ✅ ] Session downloaded successfully.'));
                        resolve(true);
                    });
                });
            });

        } catch (e) {
            logger.error(chalk.red('[ ❌ ] MEGA session error:'), e.message);
            resolve(false);
        }
    });
}

module.exports = { loadSession };
