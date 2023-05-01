import { createFile } from "ts-code-generator";
import fs from 'node:fs';
import path from 'node:path';
import readLine from 'node:readline';
import { FileControl } from "./file.class";
import { Mixin } from 'ts-mixer';
import { PackageFile } from "./package-file.class";
import ansiColors from "ansi-colors";
import { Config } from "./config.class";
import { Common } from "./common.class";
import { Module } from "./module.class";
export abstract class Entities extends Mixin(PackageFile, Common, Config, FileControl, Module) {
    //#region Properties

    //#endregion

    protected async createRouter(nameRoute: string, inputRouter: string, nameController?: string) {
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
            fs.writeFileSync(`${this.pathRoute}${file.fileName}`, file.write());
            await this.addLineRoute(inputRouter, nameRoute);
        }
        else {
            let folder: any = this.pathRoute.split(path.sep);
            folder = folder[folder.length - 2];
            throw new Error(ansiColors.blueBright(`There is no folder '${ansiColors.redBright(folder)}' to create this file`));
        }
    }

    protected async createController(nameClass: string, inputController: string, nameModel?: string) {
        let file = createFile({
            fileName: `${this.replaceAll(inputController, '-')}.${this.fileNameController}`,
            classes: [
                {
                    name: nameClass,
                    extendsTypes: ['Controller'],
                    methods: [
                        {
                            name: 'create',
                            parameters: [
                                {
                                    name: 'req',
                                    type: 'Request'
                                },
                                {
                                    name: 'res',
                                    type: 'Response',
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.body;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.body, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(this.setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                    writer.writeLine('//#region Validate params');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Registro creado' }, 201);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);

                                });
                                writer.write('catch (error: any) ').block(() => {
                                    writer.writeLine(`return res.status(500).json(this.setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
                                })
                            }
                        },
                        {
                            scope: 'public',
                            name: 'get',
                            parameters: [
                                {
                                    name: 'req',
                                    type: 'Request'
                                },
                                {
                                    name: 'res',
                                    type: 'Response'
                                }
                            ],
                            returnType: 'Promise<Response>',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.query;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.query, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(this.setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                    writer.writeLine('//#region Validate params');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Exitoso' }, 200);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);
                                });
                                writer.write('catch (error: any) ').block(() => {
                                    writer.writeLine(`return res.status(500).json(this.setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
                                })
                            }
                        },
                        {
                            scope: 'public',
                            name: 'update',
                            parameters: [
                                {
                                    name: 'req',
                                    type: 'Request'
                                },
                                {
                                    name: 'res',
                                    type: 'Response'
                                }
                            ],
                            returnType: 'Promise<Response>',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.body;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.body, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(this.setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                    writer.writeLine('//#region Validate params');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Exitoso' }, 200);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);
                                });
                                writer.write('catch (error: any) ').block(() => {
                                    writer.writeLine(`return res.status(500).json(this.setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
                                })
                            }
                        },
                        {
                            scope: 'public',
                            name: 'delete',
                            parameters: [
                                {
                                    name: 'req',
                                    type: 'Request'
                                },
                                {
                                    name: 'res',
                                    type: 'Response'
                                }
                            ],
                            returnType: 'Promise<Response>',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('const { } = req.query;');
                                writer.write('try').block(() => {
                                    writer.writeLine('//#region Validate params');
                                    writer.write('const validation = await this.validateParams(req.query, {});');
                                    writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(this.setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                    writer.writeLine('//#region Validate params');
                                    writer.blankLine();
                                    writer.writeLine(`this.setResponse({ text: 'Exitoso' }, 200);`);
                                    writer.writeLine(`return res.status(this.code).json(this.response);`);

                                });
                                writer.write('catch (error: any) ').block(() => {
                                    writer.writeLine(`return res.status(500).json(this.setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
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
                    namedImports: [{ name: ' Request' }, { name: 'Response ' }],
                    onBeforeWrite: writer => writer.writeLine('//#region Imports')
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
        if (fs.existsSync(this.pathControllers))
            fs.writeFileSync(`${this.pathControllers}${file.fileName}`, file.write().replaceAll('(req: Request, res: Response)', ' = async (req: Request, res: Response): Promise<Response> =>'));
        else {
            let folder: any = this.pathControllers.split(path.sep);
            folder = folder[folder.length - 2];
            throw new Error(ansiColors.blueBright(`There is no folder '${ansiColors.redBright(folder)}' to create this file`));
        }
    }

    protected async addLineRoute(inputRouter: string, nameRoute: string) {
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
                fs.writeFileSync(this.pathRoute + this.fileNameRoutes, modifiedContent);
            });
        } else console.log(ansiColors.blueBright(`A route with the name '${inputRouter}' already exists`));
    }

}
