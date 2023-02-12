import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { replaceAll } from "../functions/common";
import { config1 } from '../config/structure-configuration.json';

export const pathModel = path.resolve() + '/' + config1.dir + '/models';
export const createModel = (nameClass: string, inputModel: string) => {
    const file = createFile({
        fileName: `${replaceAll(inputModel, '-')}.model.ts`,
        classes: [
            {
                name: nameClass,
                isExported: true,
                extendsTypes: ['Model'],
                staticProperties: [
                    {
                        name: 'table',
                        scope: 'private',
                        type: 'string',
                        defaultExpression: `'${replaceAll(inputModel, '_')}'`
                    },
                    {
                        name: 'primeryKey',
                        defaultExpression: `'id'`,
                        scope: 'private',
                        type: 'string',
                    },
                    {
                        name: 'fields',
                        type: `T${nameClass}`,
                        scope: 'private',
                    }
                ],
                constructorDef: {
                    onWriteFunctionBody: writer => writer.write(`super(${nameClass}.table, ${nameClass}.primeryKey, ${nameClass}.fields);`)
                }
            }
        ],
        imports: [
            { moduleSpecifier: '../core/models/models', namedImports: [{ name: ' Model ' }] },
        ],
        interfaces: [
            {
                name: `I${nameClass}`,
                isExported: true,
                onAfterWrite: writer => writer.writeLine('//#endregion')
            },
        ],
        typeAliases: [
            {
                name: `T${nameClass}`,
                type: `Array<Required<keyof I${nameClass}>>`,
                isExported: true,
                onBeforeWrite: writer => writer.writeLine('//#region Interface and types')
            }
        ]
    });
    if (fs.existsSync(pathModel)) {
        fs.writeFileSync(`${pathModel}/${file.fileName}`, file.write());
    }
    else console.log("you must initialize your project");

}