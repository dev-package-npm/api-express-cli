import { createFile, FileDefinition } from "ts-code-generator";
import fs from 'node:fs';
import path from 'node:path';
import readLine from 'node:readline';
import { FileControl } from "./file.class";
import { Mixin } from 'ts-mixer';
import { PackageFile } from "./package-file.class";
import ansiColors from "ansi-colors";
import Spinnies from "spinnies";
import { Module } from "./module.class";
import { Config } from "./config.class";
import { Common } from "./common.class";

export abstract class Entities extends Mixin(PackageFile, Common, Config, FileControl, Module) {
    //#region Properties

    //#endregion

    /**
     * Initialize project structure
     * @returns 
     */
    protected async startStructure(): Promise<unknown> {
        const promise = new Promise(async (resolve, rejects) => {
            const spinnies = new Spinnies();
            try {
                const pathWork = path.resolve() + '/' + this.structureProject.dir;
                //! TODO quitar
                if (fs.existsSync(pathWork))
                    fs.rmSync(pathWork, { recursive: true });
                if (!fs.existsSync(pathWork)) {
                    let devPackages = '@types/morgan @types/express @types/node @types/bcryptjs @types/cryptr @types/jsonwebtoken nodemon typescript';
                    let _package = 'express morgan dotenv dotenv-expand bcryptjs cryptr jsonwebtoken';

                    _package = await this.getPackageNotInstalled(_package.split(' '), 'dependencies');
                    if (_package != '') {
                        spinnies.add('spinner-1', { text: ansiColors.blueBright('Installing packages') });

                        await this.executeTerminal(`npm i ${_package}`);
                        devPackages = await this.getPackageNotInstalled(devPackages.split(' '), 'devDependencies');
                        if (devPackages != '')
                            await this.executeTerminal(`npm i ${devPackages} -D`);
                        spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Done installation') });
                    }

                    const folders = this.getSubdirs().filter(value => value != 'models' && value != 'databases' && value != 'files' && value != 'services');
                    folders.forEach((value) => {
                        fs.mkdirSync(pathWork + '/' + value, { recursive: true });
                    });
                    Object.keys(this.structureProject.subDir.testing).forEach((value) => {
                        fs.mkdirSync(pathWork + '/testing/' + value, { recursive: true });
                    });
                    if (fs.existsSync(pathWork + '/routes/'))
                        fs.writeFileSync(pathWork + '/routes/' + this.createRouteIndex(0).fileName, this.createRouteIndex(0).write());
                    if (fs.existsSync(pathWork + '/testing/routes/')) {
                        fs.writeFileSync(pathWork + '/testing/routes/' + this.createRouteIndex(1).fileName, this.createRouteIndex(1).write());
                    }
                    this.createEnvFile();
                    // Create core files
                    this.createControllerCore();
                    this.createSecurityCore();
                    // Create Server http
                    this.createMiddlewares();
                    await this.createServerHttp();
                    this.createIndexApi();
                    if (!fs.existsSync(path.resolve() + '/tsconfig.json')) {
                        await this.executeTerminal(`npx tsc --init --target ES2022 --removeComments true --outDir ./${this.folderBuild}`);
                        await this.addLineFilePackage(this.folderBuild);
                    }
                    resolve(true);
                }
                else {
                    rejects(new Error(ansiColors.yellowBright('A project has already been initialized')));
                }
            } catch (error: any) {
                spinnies.fail('spinner-1', { text: ansiColors.blueBright(error.message) });
                rejects(new Error(error.message));
            }
        });

        return await promise;
    };

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

    protected createModel(nameClass: string, inputModel: string) {
        const file = createFile({
            fileName: `${this.replaceAll(inputModel, '-')}.${this.fileNameModel}`,
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
                            defaultExpression: `'${this.replaceAll(inputModel, '_')}'`
                        },
                        {
                            name: 'primariKey',
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
                        onWriteFunctionBody: writer => writer.write(`super(${nameClass}.table, ${nameClass}.primariKey, ${nameClass}.fields);`)
                    }
                }
            ],
            imports: [
                { moduleSpecifier: '../core/models/' + this.fileNameModel.split('.')[0], namedImports: [{ name: ' Model ' }] },
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
        if (fs.existsSync(this.pathModel)) {
            fs.writeFileSync(`${this.pathModel}${file.fileName}`, file.write());
        }
        else {
            let folder: any = this.pathModel.split(path.sep);
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

    protected createControllerCore() {
        const contentBaseController = fs.readFileSync(path.join(path.resolve(__dirname), './templates/controller-base.txt'), 'utf-8')
        const fileName = this.fileNameController
        if (!fs.existsSync(this.pathCoreController))
            fs.mkdirSync(this.pathCoreController, { recursive: true });
        fs.writeFileSync(this.pathCoreController + '/' + fileName, contentBaseController);
    }

    protected createSecurityCore() {
        const contentBaseController = fs.readFileSync(path.join(path.resolve(__dirname), './templates/security.txt'), 'utf-8')
        const fileName = this.fileNameSecurity
        if (!fs.existsSync(this.pathCoreSecurity))
            fs.mkdirSync(this.pathCoreSecurity, { recursive: true });
        fs.writeFileSync(this.pathCoreSecurity + '/' + fileName, contentBaseController);
    }

    protected createMiddlewares() {
        const file = createFile({
            fileName: this.fileNameMiddleware,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [
                        { name: ' Application' },
                        { name: 'Request' },
                        { name: 'Response' },
                        { name: 'NextFunction ' },
                    ],
                    defaultImportName: 'express'
                },
                {
                    moduleSpecifier: 'morgan',
                    defaultImportName: 'morgan',
                },
                {
                    moduleSpecifier: 'dotenv-expand',
                    defaultImportName: 'dotenvExpand',
                },
                {
                    moduleSpecifier: 'path',
                    defaultImportName: 'path',
                },
                {
                    moduleSpecifier: 'dotenv',
                    defaultImportName: 'dotenv',
                    onAfterWrite: writer => {
                        writer.blankLine();
                        writer.writeLine(`const config = dotenv.config({ path: path.resolve() + '/.env' });`);
                        writer.writeLine(`dotenvExpand.expand(config);`);
                        writer.blankLine();
                        writer.writeLine('const middlewares = async (app: Application): Promise<void> => {')
                            .indent().write('app.set(\'port\', process.env.PORT || 0);')
                            .newLine().indent().write('app.use(express.json());')
                            .newLine().indent().write('app.use(morgan(\'dev\'));')
                            .newLine().indent().write('app.use(express.urlencoded({ extended: true }));')
                            .newLine().indent().write('app.use((req: Request, res: Response, next: NextFunction) => {')
                            .newLine().indent().indent().write('res.header(\'Access-Control-Allow-Origin\', \' *\');')
                            .newLine().indent().indent().write('res.header(\'Access-Control-Allow-Headers\', \'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method\');')
                            .newLine().indent().indent().write('res.header(\'Access-Control-Allow-Methods\', \'GET, POST, OPTIONS, PUT, DELETE\');')
                            .newLine().indent().indent().write('res.header(\'Allow\', \'GET, POST, PUT, DELETE\');')
                            .newLine().indent().indent().write('next();')
                            .newLine().indent().write('});')
                            .newLine().write('};');;
                    }

                }
            ],
            defaultExportExpression: 'middlewares'
        });

        if (!fs.existsSync(this.pathMiddleware))
            fs.mkdirSync(this.pathMiddleware, { recursive: true });
        fs.writeFileSync(this.pathMiddleware + file.fileName, file.write());
    }

    protected async createServerHttp() {
        const file = createFile({
            fileName: this.fileNameServer,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [
                        { name: ' Application' },
                        { name: 'Request' },
                        { name: 'Response ' }
                    ],
                    defaultImportName: 'express',
                    onBeforeWrite: writer => {
                        writer.writeLine('//#region imports npm modules');
                    },
                    onAfterWrite: writer => writer.writeLine('// Local import')
                },
                {
                    moduleSpecifier: './middlewares/' + this.fileNameMiddleware.split('.')[0],
                    defaultImportName: 'middlewares',
                    onBeforeWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('// routes controller, middlewares');
                    }
                },
                {
                    moduleSpecifier: '../../routes/' + this.fileNameRoutes.split('.')[0],
                    defaultImportName: 'router',
                    onAfterWrite: writer => {
                        writer.writeLine('//#endregion');
                    }
                }
            ],
            classes: [
                {
                    name: 'Server',
                    properties: [
                        {
                            name: 'app',
                            type: 'Application'
                        },
                        {
                            scope: 'private',
                            name: 'pathDefault',
                            type: 'string',
                            defaultExpression: `'/api/abrev/v1/'`
                        }
                    ],
                    constructorDef: {
                        onWriteFunctionBody: writer => {
                            writer.writeLine('this.app = express();');
                            writer.writeLine('this.config();');
                            writer.writeLine('this.routes();');
                        }
                    },
                    methods: [
                        {
                            scope: 'private',
                            isAsync: true,
                            name: 'config',
                            onWriteFunctionBody: writer => writer.writeLine('await middlewares(this.app);')
                        },
                        {
                            scope: 'private',
                            name: 'routes',
                            onWriteFunctionBody: writer => {
                                writer.writeLine('// Show API index');
                                writer.writeLine('this.app.get(\'/\', (req: Request, res: Response) => res.status(200).send(\'index API\'));');
                                writer.writeLine('// Main routes');
                                writer.writeLine('this.app.use(this.pathDefault, router);');
                            }
                        },
                        {
                            scope: 'public',
                            name: 'start',
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`if (process.env.NODE_ENV === 'production') this.app.listen(this.app.get(\'port\'));
else
    this.app.listen(this.app.get(\'port\'), () => console.log('Server initialized and listening on the port:', this.app.get(\'port\'), \` visit: http://\${process.env[\`HOSTNAME_APP_\${String(process.env.NODE_ENV).toUpperCase()}\`]}\`));`)
                            }
                        }
                    ],
                }
            ],
            defaultExportExpression: 'Server'
        });

        if (!fs.existsSync(this.pathServer)) {
            fs.mkdirSync(this.pathServer, { recursive: true });
        }
        await fs.promises.writeFile(this.pathServer + file.fileName, file.write());
    }

    protected createIndexApi() {
        const file = createFile({
            fileName: this.fileNameIndex,
            imports: [
                {
                    moduleSpecifier: './settings/server/' + this.fileNameServer.split('.')[0],
                    defaultImportName: 'Server'
                }
            ],
            variables: [
                {
                    declarationType: 'const',
                    name: 'server',
                    type: 'Server',
                    defaultExpression: 'new Server()',
                    onAfterWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('server.start()');
                    }
                }
            ]
        });
        if (fs.existsSync(this.pathIndexApi)) {
            fs.writeFileSync(this.pathIndexApi + '/' + file.fileName, file.write());
        }
        else throw new Error(ansiColors.blueBright('you must initialize your project'));
    }


    /**
        * 
        * @param options 0: main router 1: testing router 2: services router
        * @returns FileDefinition
        */
    protected createRouteIndex(options: number): FileDefinition {
        return createFile({
            fileName: this.fileNameRoutes,
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router ' }],
                    onAfterWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('//#region rutes');
                        if (options == 0) {
                            writer.writeLine(`import testRouter from "../testing/routes/${this.fileNameRoutes.split('.')[0]}";`);
                            writer.writeLine('// Example');
                            writer.writeLine(`//import example1Router from "./example1.${this.fileNameRoutes.split('.')[0]}"`);
                        }
                        else {
                            writer.writeLine('// Example');
                            if (options == 1)
                                writer.writeLine(`//import testUserRouter from "../testing/controllers/user.test.${this.fileNameController.split('.')[0]}";`);
                            else if (options == 2)
                                writer.writeLine(`//import authRouter from "../auth/routes/${this.fileNameRoutes.split('.')[0]}";`);
                        }
                        writer.writeLine('//#endregion');
                    }
                }
            ],
            variables: [
                {
                    name: options == 0 ? 'router' : options == 1 ? 'testRouter' : 'servicesRouter',
                    defaultExpression: 'Router()',
                    declarationType: 'const',
                    onAfterWrite: writer => {
                        writer.blankLine();
                        if (options == 0) {
                            writer.writeLine('//#region Definition of routes for the api');
                            writer.writeLine('// Testing');
                            writer.writeLine('router.use(\'/testing\', testRouter);');
                            writer.writeLine('// End points for entities');
                            writer.writeLine('// Example');
                            writer.writeLine('//router.use(\'/examples1\', example1Router);');
                        }
                        else if (options == 1) {
                            writer.writeLine('//#region  Definition of routes for tests');
                            writer.writeLine('//Example');
                            writer.writeLine('//router.use(\'/test-users\', testUserRouter);');
                        }
                        else if (options == 2) {
                            writer.writeLine('//#region  Definition of routes for services');
                            writer.writeLine('// Example');
                            writer.writeLine('//router.use(\'/auth\', authRouter);');
                        }
                        writer.writeLine('//#endregion');
                    }
                }
            ],
            defaultExportExpression: options == 0 ? 'router' : options == 1 ? 'testRouter' : 'servicesRouter'
        });
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
