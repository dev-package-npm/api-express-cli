import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';

const createRouter = (nameRoute: string, inputRouter: string, nameController?: string) => {
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
    if (fs.existsSync(path.resolve('') + '/src/routes/')) {
        fs.writeFileSync(`${path.resolve('')}/src/routes/${file.fileName}`, file.write());
    }
    else console.log("you must initialize your project");
}

const createController = (nameClass: string, inputController: string, nameModel?: string) => {
    let file = createFile({
        fileName: `${inputController}.controller.ts`,
        classes: [
            {
                name: nameClass,
                staticProperties: [
                    {
                        name: 'response',
                        scope: 'private',
                        type: 'IResponse',
                        defaultExpression: 'setResponse({})'
                    },
                    {
                        scope: 'private',
                        name: 'code',
                        type: 'number',
                        defaultExpression: '200'
                    }
                ],
                methods: [
                    {
                        scope: 'public',
                        isAsync: true,
                        name: 'create',
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
                                writer.write('const validation = await validateParams(req.body, {});');
                                writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                writer.writeLine('//#region Validate params');
                                writer.blankLine();
                                writer.writeLine(`return res.status(${nameClass}.code).json(${nameClass}.response);`);

                            });
                            writer.write('catch (error: any) ').block(() => {
                                writer.writeLine(`return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
                            })
                        }
                    },
                    {
                        scope: 'public',
                        isAsync: true,
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
                                writer.write('const validation = await validateParams(req.query, {});');
                                writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                writer.writeLine('//#region Validate params');
                                writer.blankLine();
                                writer.writeLine(`return res.status(${nameClass}.code).json(${nameClass}.response);`);

                            });
                            writer.write('catch (error: any) ').block(() => {
                                writer.writeLine(`return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
                            })
                        }
                    },
                    {
                        scope: 'public',
                        isAsync: true,
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
                                writer.write('const validation = await validateParams(req.body, {});');
                                writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                writer.writeLine('//#region Validate params');
                                writer.blankLine();
                                writer.writeLine(`return res.status(${nameClass}.code).json(${nameClass}.response);`);

                            });
                            writer.write('catch (error: any) ').block(() => {
                                writer.writeLine(`return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
                            })
                        }
                    },
                    {
                        scope: 'public',
                        isAsync: true,
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
                                writer.write('const validation = await validateParams(req.query, {});');
                                writer.writeLine('if (validation != true)').indent().write(`return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));`);
                                writer.writeLine('//#region Validate params');
                                writer.blankLine();
                                writer.writeLine(`return res.status(${nameClass}.code).json(${nameClass}.response);`);

                            });
                            writer.write('catch (error: any) ').block(() => {
                                writer.writeLine(`return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));`);
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
                namedImports: [{ name: ' validateParams ' }],
                moduleSpecifier: '../core/helpers/request-http-params.helper'
            },
            {
                moduleSpecifier: '../core/helpers/response-http.helper',
                namedImports: [{ name: ' setResponse ' }],
                onAfterWrite: writer => {
                    writer.writeLine('// Models');
                    if (nameModel != undefined) {
                        writer.writeLine(`import { ${nameModel} } from "../models/${inputController}.model";`);
                    }
                    writer.writeLine('//#endregion');
                    writer.blankLine();
                    writer.writeLine('//#region Models');
                    if (nameModel != undefined) {
                        writer.writeLine(`const ${nameModel.charAt(0).toLowerCase() + nameModel.slice(1)} = new ${nameModel}();`);
                    }
                    writer.writeLine('//#endregion');
                }
            }
        ],
    });

    if (fs.existsSync(path.resolve() + '/src/controllers'))
        fs.writeFileSync(`${path.resolve('')}/src/controllers/${file.fileName}`, file.write());
    else console.log("you must initialize your project");
};

const createModel = (nameClass: string, inputModel: string) => {
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

const startStructure = () => {
    const pathWork = path.resolve() + '/public';
    const folders = ['core', 'helpers', 'models', 'services', 'controllers', 'routes', 'settings', 'testing', 'libs'];
    const foldersSecundary = ['routes', 'controllers', 'models', 'helpers'];
    fs.rmSync(pathWork, { recursive: true, force: true });
    fs.mkdirSync(pathWork);
    folders.forEach((value) => {
        fs.mkdirSync(pathWork + '/' + value);
    });
    foldersSecundary.forEach((value) => {
        fs.mkdirSync(pathWork + '/services/example/' + value, { recursive: true });
        if (value != 'models' && value != 'helpers')
            fs.mkdirSync(pathWork + '/testing/' + value);
    });
    fs.mkdirSync(pathWork + '/services/routes');
    if (fs.existsSync(pathWork + '/routes/'))
        fs.writeFileSync(pathWork + '/routes/' + routeIndex(0).fileName, routeIndex(0).write());
    if (fs.existsSync(pathWork + '/testing/routes/')) {
        fs.writeFileSync(pathWork + '/testing/routes/' + routeIndex(1).fileName, routeIndex(1).write());
    }
};

const routeIndex = (options: number) => {
    return createFile({
        fileName: 'routes.ts',
        imports: [
            {
                moduleSpecifier: 'express',
                namedImports: [{ name: ' Router ' }],
                onAfterWrite: writer => {
                    writer.blankLine();
                    writer.writeLine('//#region rutes');
                    if (options == 0)
                        writer.writeLine('import testRouter from "../testing/routes/routes";');
                    writer.writeLine('//#endregion');
                }
            }
        ],
        variables: [
            {
                name: options == 0 ? 'router' : 'testRouter',
                defaultExpression: 'Router()',
                declarationType: 'const',
                onAfterWrite: writer => {
                    writer.blankLine();
                    if (options == 0) {
                        writer.writeLine('//#region Definition of routes for the api');
                        writer.writeLine('//Testing');
                        writer.writeLine('router.use(\'testing\', testRouter);');
                        writer.writeLine('//End points for entities');
                        writer.writeLine('//Example');
                        writer.writeLine('//router.use(\'users\', userRouter);');
                    }
                    else if (options == 1) {
                        writer.writeLine('//#region  Definition of routes for tests');
                        writer.writeLine('//Example');
                        writer.writeLine('//router.use(\'users\', tesUserRouter);');
                    }

                    writer.writeLine('//#endregion');
                }
            }
        ],
        defaultExportExpression: options == 0 ? 'router' : 'testRouter'
    })
};

export { createRouter, createController, createModel, startStructure };