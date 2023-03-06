import fs from 'fs';
import path from 'path';
import readLine from 'readline';
import { Common } from './common.class';

export class PackageFile extends Common {
    private pathFilePackage: string = path.join(path.resolve(), '/package.json');
    constructor() {
        super();
    }

    async getVersion(): Promise<string> {
        return (await this.getProperties('version')).replaceAll('"', '').replace(',', '');
    }

    async getProperties(paramsToSearch: string): Promise<string> {
        const content = fs.createReadStream(this.pathFilePackage, { encoding: 'utf-8' });
        const rl = readLine.createInterface({ input: content });
        let dataResponse: string = '';
        let controlRead: boolean = false;
        for await (const line of rl) {
            if (line.includes(paramsToSearch)) {
                if (line.includes('{') || line.includes('}') || line.includes('[') || line.includes(']')) {
                    controlRead = true;
                }
                else
                    return dataResponse = line.split(':')[1];
            }
            if (controlRead && (line.includes('}') || line.includes(']'))) {
                controlRead = false;
                return dataResponse;
            }
            if (controlRead && (!line.includes('{') && !line.includes('[')))
                dataResponse += line + '\n';

        }
        return dataResponse;
    }

    protected async getPackageNotInstalled(pack: Array<string>, typeDependece: 'devDependencies' | 'dependencies') {
        let results = (await this.getProperties(typeDependece)).split(',');
        results = results.map((value) => value.split(':')[0].replaceAll('\"', '').replaceAll('\n', '').replaceAll(' ', ''));
        let valueReturn = '';
        let control = false;
        for (const item of pack) {
            for (const item2 of results) {
                if (item == item2 && control == false) {
                    control = true;
                    continue;
                }
            }
            if (control == false) {
                valueReturn += item + ' ';
                continue;
            }
            if (control == true) {
                control = false;
            }
        }
        return valueReturn;
    }

    protected async addLineFilePackage(dist: string) {
        const scripts = {
            start: `"start": "node ./${dist}/index",`,
            dev: `"dev:watch-server": "nodemon ./${dist}/index",`,
            watch_ts: '"watch-ts": "npx tsc -w",'
        }
        const pathPackage = path.resolve() + '/package.json';
        const content = fs.createReadStream(pathPackage, { encoding: 'utf-8' });
        const rl = readLine.createInterface({ input: content });
        let modifiedContent = '';

        const controlWrite = await this.isExistsWord(rl, Object.values(scripts));

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
}