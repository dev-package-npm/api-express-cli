import fs from 'fs';
import path from 'path';
import readLine from 'readline';

export class PackageFile {
    private pathFile: string = path.join(path.resolve(), '/package.json');

    async getVersion(): Promise<string> {
        return (await this.getProperties('version')).replaceAll('"', '').replace(',', '');
    }

    async getProperties(paramsToSearch: string): Promise<string> {
        const content = fs.createReadStream(this.pathFile, { encoding: 'utf-8' });
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
}