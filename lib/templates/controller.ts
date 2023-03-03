import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from "../config/structure-configuration.json";
import { replaceAll } from "../functions/common";
import ansiColors from "ansi-colors";

export const pathController = path.resolve() + '/' + config1.dir + '/controllers/';
export const createController = (nameClass: string, inputController: string, nameModel?: string) => {
    let file = createFile({
        fileName: `${replaceAll(inputController, '-')}.controller.ts`,
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
                moduleSpecifier: '../core/controllers/controller',
                onAfterWrite: writer => {
                    writer.writeLine('// Models');
                    if (nameModel != undefined) {
                        writer.writeLine(`import { ${nameModel} } from "../models/${replaceAll(inputController, '-')}.model";`);
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
    if (fs.existsSync(pathController))
        fs.writeFileSync(`${pathController}${file.fileName}`, file.write().replaceAll('(req: Request, res: Response)', ' = async (req: Request, res: Response): Promise<Response> =>'));
    else console.log(ansiColors.blueBright('You must initialize your project'));
};