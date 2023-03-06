import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'node:fs';
import readLine from 'readline';
import { Common } from './common.class';

export abstract class Env extends Common {
    protected readonly pathFileEnv = path.resolve() + '/.env';

    protected createEnvFile() {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(Date(), salt);
        const content = `# system environments
NODE_ENV=development
# NODE_ENV=production
PORT=3000
HOSTNAME_APP_DEVELOPMENT=localhost:\${PORT}
HOSTNAME_APP_PRODUCTION=example.api-express-cli.com

# DB config
#HOST_DB_DEVELOPMENT=127.0.0.1
#USER_DB_DEVELOPMENT=root
#USER_PASSWORD_DEVELOPMENT=
#DB_NAME_DEVELOPMENT=db_test

#HOST_DB_PRODUCTION=127.0.0.1
#USER_DB_PRODUCTION=user_test
#USER_PASSWORD_PRODUCTION=12345
#DB_NAME_PRODUCTION=db_test

#key: Do not change, if you already generated passwords or token
KEY='${hash}'`;

        fs.writeFileSync(this.pathFileEnv, content);
    }

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
}