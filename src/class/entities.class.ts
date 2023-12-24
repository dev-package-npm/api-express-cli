import { createFile } from "ts-code-generator";
import fs from 'node:fs';
import path from 'node:path';
import readLine from 'node:readline';
import { FileControl } from "./file.class";
import { Mixin } from 'ts-mixer';
import { PackageFile } from "./package-file.class";
import ansiColors, { blueBright, greenBright } from "ansi-colors";
import { Config } from "./config.class";
import { Common } from "./common.class";
import { Module } from "./module.class";

export abstract class Entities extends Mixin(PackageFile, Common, Config, FileControl, Module) {
    //#region Properties

    //#endregion

    protected async createRouter({ nameRoute, inputRouter, nameController, forceOverwrite }: { nameRoute: string, inputRouter: string, nameController?: string, forceOverwrite?: boolean }) {
        let file;
        if (nameController != undefined) {
            let variableController = nameController?.charAt(0).toLowerCase() + nameController?.slice(1);
            file = createFile({
                fileName: `${this.replaceAll(inputRouter, '-')}.${this.fileNameRoutes}`,
                imports: [
                    {
                        moduleSpecifier: 'express',
                        namedImports: [{ name: ' Router ' }],
                        onBeforeWrite: writer => writer.writeLine('//#region Imports')
                    },
                    {
                        moduleSpecifier: '../controllers/' + this.replaceAll(inputRouter, '-') + '.' + this.fileNameController.split('.')[0],
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
                fileName: `${this.replaceAll(inputRouter, '-')}.${this.fileNameRoutes}`,
                imports: [
                    {
                        moduleSpecifier: 'express',
                        namedImports: [{ name: ' Router ' }],
                        onBeforeWrite: writer => {
                            writer.writeLine('//#region Imports');

                        },
                        onAfterWrite: writer => {
                            writer.writeLine('//Example');
                            writer.writeLine(`//import Example1Controller from "../controllers/example1.${this.fileNameController.split('.')[0]}"`);
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
        if (fs.existsSync(this.pathRoute)) {
            if (fs.existsSync(this.pathRoute + file.fileName) && (forceOverwrite == undefined || !forceOverwrite)) throw new Error(`The ${ansiColors.blueBright(file.fileName)} file already exists`);
            console.log(forceOverwrite && fs.existsSync(this.pathRoute + file.fileName) ? blueBright('UPDATED') : greenBright('CREATED'), (this.pathRoute + file.fileName).split(this.structureProject.dir)[1]);
            fs.writeFileSync(`${this.pathRoute}${file.fileName}`, file.write());
            await this.addLineRoute({ inputRouter, nameRoute, forceOverwrite });
        }
        else {
            let folder: any = this.pathRoute.split(path.sep);
            folder = folder[folder.length - 2];
            throw new Error(ansiColors.blueBright(`There is no folder '${ansiColors.redBright(folder)}' to create this file`));
        }
    }

    protected async createController({ nameClass, inputController, nameModel, forceOverwrite }: { nameClass: string, inputController: string, nameModel?: string, forceOverwrite?: boolean }) {
        let file = createFile({
            fileName: `${this.replaceAll(inputController, '-')}.${this.fileNameController}`,
            classes: [
                {
                    name: nameClass,
                    extendsTypes: ['Controller'],
                    methods: [
                        {
                            name: 'create = async (req: Request, res: Response, next: NextFunction) =>',
                            returnType: ":Promise<Response> => ",
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.body;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.body, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`throw new ErrorRest({ message: 'Los parámetros son inválidos', status: 700, detail: validation }, 400);`);
                                    writer.writeLine('//#endregion');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Registro creado' }, 201);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);

                                });
                                writer.write('catch (error) ').block(() => {
                                    writer.writeLine(`next(error);`);
                                })
                            }
                        },
                        {
                            scope: 'public',
                            name: 'get = async (req: Request, res: Response, next: NextFunction) =>',
                            returnType: 'Promise<Response>',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.query;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.query, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`throw new ErrorRest({ message: 'Los parámetros son inválidos', status: 700, detail: validation }, 400);`);
                                    writer.writeLine('//#endregion');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Exitoso' }, 200);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);
                                });
                                writer.write('catch (error) ').block(() => {
                                    writer.writeLine(`next(error);`);
                                })
                            }
                        },
                        {
                            scope: 'public',
                            name: 'update = async (req: Request, res: Response, next: NextFunction) =>',
                            returnType: 'Promise<Response>',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.body;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.body, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`throw new ErrorRest({ message: 'Los parámetros son inválidos', status: 700, detail: validation }, 400);`);
                                    writer.writeLine('//#endregion');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Exitoso' }, 200);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);
                                });
                                writer.write('catch (error) ').block(() => {
                                    writer.writeLine(`next(error);`);
                                })
                            }
                        },
                        {
                            scope: 'public',
                            name: 'delete = async (req: Request, res: Response, next: NextFunction) =>',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.query;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.query, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`throw new ErrorRest({ message: 'Los parámetros son inválidos', status: 700, detail: validation }, 400);`);
                                    writer.writeLine('//#endregion');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Exitoso' }, 200);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);

                                });
                                writer.write('catch (error) ').block(() => {
                                    writer.writeLine(`next(error);`);
                                })
                            }
                        }
                    ]
                },
            ],
            defaultExportExpression: nameClass,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Request' }, { name: 'Response' }, { name: 'NextFunction ' }],
                    onBeforeWrite: writer => writer.writeLine('//#region Imports')
                },
                {
                    defaultImportName: 'ErrorRest',
                    moduleSpecifier: '../core/libs/error-rest'
                },
                {
                    onBeforeWrite: writer => writer.writeLine('// Local'),
                    namedImports: [{ name: ' Controller ' }],
                    moduleSpecifier: '../core/controllers/' + this.fileNameController.split('.')[0],
                    onAfterWrite: writer => {
                        writer.writeLine('// Models');
                        if (nameModel != undefined) {
                            writer.writeLine(`import { ${nameModel} } from "../models/${this.replaceAll(inputController, '-')}.${this.fileNameModel.split('.')[0]}";`);
                        }
                        writer.writeLine('//#endregion');
                        writer.blankLine();
                    }
                }
            ],
        });
        if (nameModel != undefined)
            file.getClass(nameClass)?.addProperty({
                name: nameModel.charAt(0).toLowerCase() + nameModel.slice(1),
                scope: 'private',
                defaultExpression: `new ${nameModel}()`,
                onAfterWrite: writer => {
                    writer.writeLine('//#endregion');
                },
                onBeforeWrite: writer => {
                    writer.writeLine('//#region Models');
                }
            });
        if (fs.existsSync(this.pathControllers)) {
            if (fs.existsSync(this.pathControllers + file.fileName) && (forceOverwrite == undefined || !forceOverwrite)) throw new Error(`The ${ansiColors.blueBright(file.fileName)} file already exists`);
            console.log(forceOverwrite && fs.existsSync(this.pathControllers + file.fileName) ? blueBright('UPDATED') : greenBright('CREATED'), (this.pathControllers + file.fileName).split(this.structureProject.dir)[1]);
            fs.writeFileSync(`${this.pathControllers}${file.fileName}`, file.write().replaceAll('()', ''));
        }
        else {
            let folder: any = this.pathControllers.split(path.sep);
            folder = folder[folder.length - 2];
            throw new Error(ansiColors.blueBright(`There is no folder '${ansiColors.redBright(folder)}' to create this file`));
        }
    }

    protected async addLineRoute({ inputRouter, nameRoute, forceOverwrite }: { inputRouter: string, nameRoute: string, forceOverwrite?: boolean }) {
        const content = fs.createReadStream(this.pathRoute + this.fileNameRoutes, 'utf8');
        let rl = readLine.createInterface({ input: content, crlfDelay: Infinity });
        let modifiedContent = '';
        const endPonit = this.replaceAll(inputRouter, '-');
        const importRoute = `\nimport ${nameRoute} from './${this.replaceAll(inputRouter, '-')}.${this.fileNameRoutes.split('.')[0]}';\n`;
        const routerUse = `\nrouter.use('/${endPonit.charAt(endPonit.length - 1) == 's' ? endPonit : endPonit + 's'}', ${nameRoute});\n`;
        let controlWrite = false;
        controlWrite = await this.isExistsWord(rl, [importRoute, routerUse, `${nameRoute}`]);
        if (!controlWrite) {
            const content = fs.createReadStream(this.pathRoute + this.fileNameRoutes, 'utf8');
            let rl = readLine.createInterface({ input: content, crlfDelay: Infinity });
            rl.on('line', line => {
                if (line.includes('//#region routes') != false) {
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
                fs.writeFileSync(this.pathRoute + this.fileNameRoutes, modifiedContent);
                console.log(blueBright('UPDATED'), (this.pathRoute + this.fileNameRoutes).split(this.structureProject.dir)[1]);
            });
        } else if (forceOverwrite == undefined || !forceOverwrite) console.log(ansiColors.blueBright(`A route with the name '${inputRouter}' already exists`));
    }

}
