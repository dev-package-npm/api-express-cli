import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { dir } from '../config/structure-configuration.json';

const pathRoute = path.resolve() + '/' + dir + '/routes/';

export const createRouter = (nameRoute: string, inputRouter: string, nameController?: string) => {
    let file;
    if (nameController != undefined) {
        let variableController = nameController?.charAt(0).toLowerCase() + nameController?.slice(1);
        file = createFile({
            fileName: `${inputRouter}.route.ts`,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router ' }],
                    onBeforeWrite: writer => writer.writeLine('//#region Imports')
                },
                {
                    moduleSpecifier: '../controllers/' + inputRouter + '.controller',
                    defaultImportName: nameController,
                    onAfterWrite: writer => writer.writeLine('//#enregion')
                },
            ],
            variables: [
                {
                    name: nameRoute,
                    type: 'Router',
                    declarationType: 'const',
                    defaultExpression: 'Router()'
                },
                {
                    name: variableController,
                    type: nameController,
                    declarationType: 'const',
                    defaultExpression: `new ${nameController}()`,
                    onAfterWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('// End points');
                        writer.writeLine(`${nameRoute}.route('')`)
                            .indent().write(`.post(${variableController}.create)`);
                        writer.newLine().indent().write(`.get(${variableController}.get)`);
                        writer.newLine().indent().write(`.put(${variableController}.update)`);
                        writer.newLine().indent().write(`.delete(${variableController}.delete);`);
                    }
                },
            ],
            defaultExportExpression: `${nameRoute}`
        });
    } else
        file = createFile({
            fileName: `${inputRouter}.route.ts`,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router ' }],
                    onBeforeWrite: writer => {
                        writer.writeLine('//#region Imports');

                    },
                    onAfterWrite: writer => {
                        writer.writeLine('//Example');
                        writer.writeLine('//import User from "../controllers/user.controller"');
                        writer.writeLine('//#enregion');
                    }
                }
            ],
            variables: [
                {
                    name: nameRoute,
                    type: 'Router',
                    declarationType: 'const',
                    defaultExpression: 'Router()',
                    onAfterWrite: writer => {
                        writer.writeLine('//Example');
                        writer.writeLine('// const user = new User();');
                        writer.writeLine('// End points');
                        writer.writeLine(`//${nameRoute}.route('')`).write('//')
                            .indent().write(`.post(user.create)`);
                        writer.newLine().write('//').indent().write(`.get(user.get)`);
                        writer.newLine().write('//').indent().write(`.put(user.update)`);
                        writer.newLine().write('//').indent().write(`.delete(user.delete);`);
                    }
                }
            ],
            defaultExportExpression: `${nameRoute}`
        });
    // console.log(file.write());
    if (fs.existsSync(pathRoute)) {
        fs.writeFileSync(`${pathRoute}${file.fileName}`, file.write());
    }
    else console.log("you must initialize your project");
}
