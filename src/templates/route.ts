import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
import readLine from 'readline';

// Local
import { config1 } from '../config/structure-configuration.json';
import { isExistsWord, replaceAll } from "../functions/common";
import ansiColors from "ansi-colors";

const pathRoute = path.resolve() + '/' + config1.dir + '/routes/';

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
                            .indent().write(`.post((req: Request, res: Response) => ${variableController}.create(req, res))`);
                        writer.newLine().indent().write(`.get((req: Request, res: Response) => ${variableController}.get(req, res))`);
                        writer.newLine().indent().write(`.put((req: Request, res: Response) => ${variableController}.update(req, res))`);
                        writer.newLine().indent().write(`.delete((req: Request, res: Response) => ${variableController}.delete(req, res));`);
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
                    namedImports: [{ name: ' Router' }, { name: 'Request' }, { name: 'Response ' }],
                    onBeforeWrite: writer => {
                        writer.writeLine('//#region Imports');

                    },
                    onAfterWrite: writer => {
                        writer.writeLine('//Example');
                        writer.writeLine('//import UserController from "../controllers/user.controller"');
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
                        writer.writeLine('// const user = new UserController();');
                        writer.writeLine('// End points');
                        writer.writeLine(`//${nameRoute}.route('')`).write('//')
                            .indent().write(`.post((req:Request, res:Response) => user.create(req, res))`);
                        writer.newLine().write('//').indent().write(`.get((req:Request, res:Response) => user.get(req, res))`);
                        writer.newLine().write('//').indent().write(`.put((req:Request, res:Response) => user.update(req, res))`);
                        writer.newLine().write('//').indent().write(`.delete((req:Request, res:Response) => user.delete(req, res));`);
                    }
                }
            ],
            defaultExportExpression: `${nameRoute}`
        });
    if (fs.existsSync(pathRoute)) {
        {
            fs.writeFileSync(`${pathRoute}${file.fileName}`, file.write());

            const content = fs.createReadStream(pathRoute + 'routes.ts', 'utf8');
            let lr = readLine.createInterface({ input: content, crlfDelay: Infinity });
            let modifiedContent = '';
            const endPonit = replaceAll(inputRouter, '-');
            const importRoute = `\nimport ${nameRoute} from './${replaceAll(inputRouter, '-')}.route';\n`;
            const routerUse = `\nrouter.use('${endPonit.charAt(endPonit.length - 1) == 's' ? endPonit : endPonit + 's'}', ${nameRoute});\n`;
            let controlWrite = false;
            controlWrite = await isExistsWord(lr, [importRoute, routerUse, `${nameRoute}`]);
            if (!controlWrite) {
                const content = fs.createReadStream(pathRoute + 'routes.ts', 'utf8');
                let lr = readLine.createInterface({ input: content, crlfDelay: Infinity });
                lr.on('line', line => {
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

                lr.on('close', () => {
                    fs.writeFileSync(pathRoute + 'routes.ts', modifiedContent);
                });
            } else console.log(ansiColors.redBright(`A route with the name '${inputRouter}' already exists`));

        }
    }
    else console.log("You must initialize your project");
}

