'use strict';
const { File, Storage } = require('megajs');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class MegaManager {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.storage = null;
    }

    async login() {
        if (!this.email || !this.password) {
            throw new Error('MEGA credentials not provided');
        }

        this.storage = new Storage({
            email: this.email,
            password: this.password,
        });

        await this.storage.login();
        logger.info('✅ MEGA login successful');
        return this.storage;
    }

    async uploadFile(filePath, fileName) {
        if (!this.storage) await this.login();
        
        const file = fs.readFileSync(filePath);
        const upload = await this.storage.upload({
            name: fileName || path.basename(filePath),
            size: file.length,
        });

        await upload.write(file);
        logger.info(`📤 Uploaded ${fileName} to MEGA`);
        
        return upload;
    }

    async downloadFile(fileKey, outputPath) {
        try {
            const filer = File.fromURL(`https://mega.nz/file/${fileKey}`);
            
            return new Promise((resolve, reject) => {
                filer.loadAttributes((attrErr) => {
                    if (attrErr) {
                        reject(new Error(`Failed to load attributes: ${attrErr.message}`));
                        return;
                    }

                    filer.download((err, data) => {
                        if (err) {
                            reject(new Error(`Download failed: ${err.message}`));
                            return;
                        }

                        fs.writeFile(outputPath, data, (writeErr) => {
                            if (writeErr) {
                                reject(new Error(`Failed to write file: ${writeErr.message}`));
                                return;
                            }
                            resolve({ success: true, path: outputPath });
                        });
                    });
                });
            });
        } catch (error) {
            throw new Error(`MEGA download error: ${error.message}`);
        }
    }

    async getFileInfo(fileKey) {
        try {
            const filer = File.fromURL(`https://mega.nz/file/${fileKey}`);
            
            return new Promise((resolve, reject) => {
                filer.loadAttributes((attrErr) => {
                    if (attrErr) {
                        reject(new Error(`Failed to load attributes: ${attrErr.message}`));
                        return;
                    }

                    resolve({
                        name: filer.name,
                        size: filer.size,
                        type: filer.mime,
                        created: filer.timestamp,
                    });
                });
            });
        } catch (error) {
            throw new Error(`Failed to get file info: ${error.message}`);
        }
    }
}

module.exports = MegaManager;
