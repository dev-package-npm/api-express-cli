import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'node:fs';
import readLine from 'readline';
import { Common } from './common.class';

export abstract class Env extends Common {
    protected pathFileEnv = path.join(path.resolve(), './.env');

    protected async addLineEnv(): Promise<void> {
        try {
            const content = fs.createReadStream(this.pathFileEnv, { encoding: 'utf-8' });
            let rl = readLine.createInterface({ input: content });
            let modifiedContent = '';

            const controlWrite = await this.isExistsWord(rl, ['#HOST_DB_DEVELOPMENT=127.0.0.1', '#HOST_DB_PRODUCTION=127.0.0.1']);

            if (controlWrite) {
                const content = fs.createReadStream(this.pathFileEnv, { encoding: 'utf-8' });
                rl = readLine.createInterface({ input: content });
                let controlRead = false;
                rl.on('line', line => {
                    if (line.includes('# DB config')) {
                        modifiedContent += line + '\n';
                        controlRead = true
                    }
                    else if (controlRead) {
                        line = line.replace('#', '');
                        modifiedContent += line + '\n';
                        if (line.includes('DB_NAME_PRODUCTION=db_test')) controlRead = false;
                    }
                    else modifiedContent += line + '\n';
                });
                rl.on('close', () => {
                    fs.writeFileSync(this.pathFileEnv, modifiedContent);
                });
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async writeHashInKey(pathEnv?: string) {
        this.pathFileEnv = pathEnv || this.pathFileEnv;
        const hash = this.getHash();
        const content = fs.createReadStream(this.pathFileEnv, { encoding: 'utf-8' });
        let rl = readLine.createInterface({ input: content });
        let modifiedContent = '';

        const controlWrite = await this.isExistsWord(rl, ['KEY=']);

        if (controlWrite) {
            const content = fs.createReadStream(this.pathFileEnv, { encoding: 'utf-8' });
            rl = readLine.createInterface({ input: content });

            rl.on('line', line => {
                if (line.includes('KEY=\''))
                    modifiedContent += line.split('=')[0] + `='${hash}'\n`;
                else modifiedContent += line + '\n';
            });
            rl.on('close', () => {
                fs.writeFileSync(this.pathFileEnv, modifiedContent);
            });
        }
    }

    protected async removeLineEnv() {
        const content = fs.createReadStream(this.pathFileEnv, { encoding: 'utf-8' });
        let rl = readLine.createInterface({ input: content });
        let modifiedContent = '';

        const controlWrite = await this.isExistsWord(rl, ['HOST_DB_DEVELOPMENT=127.0.0.1', 'DB_NAME_DEVELOPMENT=db_test', 'HOST_DB_PRODUCTION=127.0.0.1']);

        if (controlWrite) {
            const content = fs.createReadStream(this.pathFileEnv, { encoding: 'utf-8' });
            rl = readLine.createInterface({ input: content });
            let controlRead = false;
            rl.on('line', line => {
                if (line.includes('# DB config')) {
                    modifiedContent += line + '\n';
                    controlRead = true
                }
                else if (controlRead) {
                    if (line != '' && !line.includes('#')) {
                        line = '#' + line;
                        modifiedContent += line + '\n';
                    } else modifiedContent += line + '\n';
                    if (line.includes('#DB_NAME_PRODUCTION=db_test')) controlRead = false;
                }
                else modifiedContent += line + '\n';
            });
            rl.on('close', () => {
                fs.writeFileSync(this.pathFileEnv, modifiedContent);
            });
        }
    }

    protected getHash(): string {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(Date(), salt);
        return hash.replaceAll('$', '');
    }
}