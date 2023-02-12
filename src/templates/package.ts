import readLine from 'readline';
import fs from 'fs';
import path from 'path';
import { isExistsWord } from '../functions/common';

const scripts = {
    start: '"start": "node ./dist/index",',
    dev: '"dev:watch-server": "nodemon ./build/test1/index",',
    watch_ts: '"watch-ts": "npx tsc -w",'
}

export const addLineFilePackage = async () => {
    const content = fs.createReadStream(path.resolve() + '/package.json', { encoding: 'utf-8' });
    const rl = readLine.createInterface({ input: content });
    let modifiedContent = '';

    const controlWrite = await isExistsWord(rl, Object.values(scripts));

    if (!controlWrite) {
        const content = fs.createReadStream(path.resolve() + '/package.json', { encoding: 'utf-8' });
        const rl = readLine.createInterface({ input: content });
        rl.on('line', line => {
            if (line.includes('"scripts": {')) {
                modifiedContent += line;
                modifiedContent += scripts.start + '\n';
                modifiedContent += scripts.dev + '\n';
                modifiedContent += scripts.watch_ts + '\n';
            } else modifiedContent += line + '\n';
        });
    }
}