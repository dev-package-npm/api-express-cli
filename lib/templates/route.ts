import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
import readLine from 'readline';

// Local
import { config1 } from '../config/structure-configuration.json';
import { isExistsWord, replaceAll } from "../functions/common";
import ansiColors from "ansi-colors";

export const pathRoute = path.resolve() + '/' + config1.dir + '/routes/';

export const createRouter = async (nameRoute: string, inputRouter: string, nameController?: string) => {
    let file;
    if (nameController != undefined) {
        let variableController = nameController?.charAt(0).toLowerCase() + nameController?.slice(1);
        file = createFile({
            fileName: `${replaceAll(inputRouter, '-')}.route.ts`,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router' }, { name: 'Request' }, { name: 'Response ' }],
                    onBeforeWrite: writer => writer.writeLine('//#region Imports')
                },
                {
                    moduleSpecifier: '../controllers/' + replaceAll(inputRouter, '-') + '.controller',
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
            fileName: `${replaceAll(inputRouter, '-')}.route.ts`,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router ' }],
                    onBeforeWrite: writer => {
                        writer.writeLine('//#region Imports');

                    },
                    onAfterWrite: writer => {
                        writer.writeLine('//Example');
                        writer.writeLine('//import Example1Controller from "../controllers/example1.controller"');
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
                        writer.writeLine('// const example1 = new Example1Controller();');
                        writer.writeLine('// End points');
                        writer.writeLine(`//${nameRoute}.route('')`).write('//')
                            .indent().write(`.post(example1.create)`);
                        writer.newLine().write('//').indent().write(`.get(example1.get)`);
                        writer.newLine().write('//').indent().write(`.put(example1.update)`);
                        writer.newLine().write('//').indent().write(`.delete(example1.delete);`);
                    }
                }
            ],
            defaultExportExpression: `${nameRoute}`
        });
    if (fs.existsSync(pathRoute)) {
        fs.writeFileSync(`${pathRoute}${file.fileName}`, file.write());

        await addLineRoute(inputRouter, nameRoute);
    }
    else console.log(ansiColors.blueBright('You must initialize your project'));
}

const addLineRoute = async (inputRouter: string, nameRoute: string) => {
    const content = fs.createReadStream(pathRoute + 'routes.ts', 'utf8');
    let rl = readLine.createInterface({ input: content, crlfDelay: Infinity });
    let modifiedContent = '';
    const endPonit = replaceAll(inputRouter, '-');
    const importRoute = `\nimport ${nameRoute} from './${replaceAll(inputRouter, '-')}.route';\n`;
    const routerUse = `\nrouter.use('/${endPonit.charAt(endPonit.length - 1) == 's' ? endPonit : endPonit + 's'}', ${nameRoute});\n`;
    let controlWrite = false;
    controlWrite = await isExistsWord(rl, [importRoute, routerUse, `${nameRoute}`]);
    if (!controlWrite) {
        const content = fs.createReadStream(pathRoute + 'routes.ts', 'utf8');
        let rl = readLine.createInterface({ input: content, crlfDelay: Infinity });
        rl.on('line', line => {
            if (line.includes('//#region rutes') != false) {
                modifiedContent += line;
                modifiedContent += importRoute;
            }
            else if (line.includes(`// End points for entities`) != false) {
                modifiedContent += line;
                modifiedContent += routerUse;
            }
            else modifiedContent += line + '\n';
        });

        rl.on('close', () => {
            fs.writeFileSync(pathRoute + 'routes.ts', modifiedContent);
        });
    } else console.log(ansiColors.blueBright(`A route with the name '${inputRouter}' already exists`));
}
