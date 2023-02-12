import readLine from 'readline';
import fs from 'fs';
import path from 'path';
import { isExistsWord } from '../functions/common';



export const addLineFilePackage = async (dist: string) => {
    const scripts = {
        start: `"start": "node ./${dist}/index",`,
        dev: `"dev:watch-server": "nodemon ./${dist}/index",`,
        watch_ts: '"watch-ts": "npx tsc -w",'
    }
    const pathPackage = path.resolve() + '/package.json';
    const content = fs.createReadStream(pathPackage, { encoding: 'utf-8' });
    const rl = readLine.createInterface({ input: content });
    let modifiedContent = '';

    const controlWrite = await isExistsWord(rl, Object.values(scripts));

    if (!controlWrite) {
        const content = fs.createReadStream(pathPackage, { encoding: 'utf-8' });
        const rl = readLine.createInterface({ input: content });
        rl.on('line', line => {
            if (line.includes('"scripts": {')) {
                modifiedContent += line;
                modifiedContent += '\n\t\t' + scripts.start + '\n';
                modifiedContent += '\t\t' + scripts.dev + '\n';
                modifiedContent += '\t\t' + scripts.watch_ts + '\n';
            } else modifiedContent += line + '\n';
        });
        rl.on('close', () => {
            fs.writeFileSync(pathPackage, modifiedContent);
        });
    }
}