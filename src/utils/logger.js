'use strict';
const pino = require('pino');
const chalk = require('chalk');

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
        },
    },
});

// Custom logger with colored output
logger.info = (msg, ...args) => {
    console.log(chalk.blue('[INFO]'), msg, ...args);
};

logger.error = (msg, ...args) => {
    console.log(chalk.red('[ERROR]'), msg, ...args);
};

logger.warn = (msg, ...args) => {
    console.log(chalk.yellow('[WARN]'), msg, ...args);
};

logger.debug = (msg, ...args) => {
    console.log(chalk.gray('[DEBUG]'), msg, ...args);
};

logger.success = (msg, ...args) => {
    console.log(chalk.green('[✅]'), msg, ...args);
};

module.exports = logger;
