import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
import { Errors } from "./errors.class";
import { Common } from "./common.class";
import { config1 } from '../config/structure-configuration.json';
import { FileControl } from "./file.class";
import { Config } from "./config.class";
import { Mixin } from 'ts-mixer';

export abstract class Entities extends Mixin(Errors, Common, Config, FileControl) {
    //#region Properties
    protected pathRoute: string = path.resolve() + '/' + config1.dir + '/routes/';
    //#endregion

    async createRoute(nameRoute: string, inputRouter: string, nameController?: string) {
        let file;
        if (nameController != undefined) {
            let variableController = nameController?.charAt(0).toLowerCase() + nameController?.slice(1);
            file = createFile({
                fileName: `${this.replaceAll(inputRouter, '-')}.route.ts`,
                imports: [
                    {
                        moduleSpecifier: 'express',
                        namedImports: [{ name: ' Router' }, { name: 'Request' }, { name: 'Response ' }],
                        onBeforeWrite: writer => writer.writeLine('//#region Imports')
                    },
                    {
                        moduleSpecifier: '../controllers/' + this.replaceAll(inputRouter, '-') + '.controller',
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
                fileName: `${this.replaceAll(inputRouter, '-')}.route.ts`,
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
        if (fs.existsSync(this.pathRoute)) {
            fs.writeFileSync(`${this.pathRoute}${file.fileName}`, file.write());

            // await addLineRoute(inputRouter, nameRoute);
        }
        else console.log("You must initialize your project");
    }

}
