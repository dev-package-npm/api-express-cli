import { createFile } from "ts-code-generator";
import { config1 } from '../config/structure-configuration.json';
import fs from 'fs';
import path from 'path';
import ansiColors from "ansi-colors";

const pathIndexApi = path.resolve() + '/' + config1.dir;

export const createIndexApi = () => {
    const file = createFile({
        fileName: 'index.ts',
        imports: [
            {
                moduleSpecifier: './settings/server/server',
                defaultImportName: 'Server'
            }
        ],
        variables: [
            {
                declarationType: 'const',
                name: 'server',
                type: 'Server',
                defaultExpression: 'new Server()',
                onAfterWrite: writer => {
                    writer.blankLine();
                    writer.writeLine('server.start()');
                }
            }
        ]
    });
    if (fs.existsSync(pathIndexApi)) {
        fs.writeFileSync(pathIndexApi + '/' + file.fileName, file.write());
    }
    else console.log(ansiColors.blueBright('You must initialize your project'));
};