import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';

export const createModel = (nameClass: string, inputModel: string) => {
    const file = createFile({
        fileName: `${inputModel}.model.ts`,
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
                        defaultExpression: `'${String(inputModel).replaceAll('-', '_')}'`
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
            { moduleSpecifier: '../core/models/model', namedImports: [{ name: ' Model ' }] },
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
    // console.log(file.write());
    if (fs.existsSync(path.resolve('') + '/src/models/')) {
        fs.writeFileSync(`${path.resolve('')}/src/models/${file.fileName}`, file.write());
    }
    else console.log("you must initialize your project");

}