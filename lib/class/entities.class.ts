import { createFile, FileDefinition } from "ts-code-generator";
import fs from 'node:fs';
import path from 'node:path';
import { Errors } from "./errors.class";
import { FileControl } from "./file.class";
import { Config } from "./config.class";
import { Mixin } from 'ts-mixer';
import { PackageFile } from "./package-file.class";

export abstract class Entities extends Mixin(Errors, PackageFile, Config, FileControl) {
    //#region Properties
    protected readonly pathRoute: string = path.resolve() + '/' + this.structureProject.dir + '/routes/';
    protected readonly pathControllerCore = path.resolve() + '/' + this.structureProject.dir + '/core/controllers/';
    protected readonly pathSecurityCore = path.resolve() + '/' + this.structureProject.dir + '/core/libs/';
    protected readonly pathMiddleware = path.resolve() + '/' + this.structureProject.dir + '/settings/server/middlewares/';
    protected readonly pathServer = path.resolve('') + '/' + this.structureProject.dir + '/settings/server/';
    protected readonly pathIndexApi = path.resolve() + '/' + this.structureProject.dir;
    //#endregion

    protected async createRoute(nameRoute: string, inputRouter: string, nameController?: string) {
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

    protected createControllerCore() {
        const contentBaseController = fs.readFileSync(path.join(path.resolve(__dirname), './templates/controller-base.txt'), 'utf-8')
        const fileName = this.structureProject.subDir.core.controllers[0]
        if (!fs.existsSync(this.pathControllerCore))
            fs.mkdirSync(this.pathControllerCore, { recursive: true });
        fs.writeFileSync(this.pathControllerCore + '/' + fileName, contentBaseController);
    }

    protected createSecurityCore() {
        const contentBaseController = fs.readFileSync(path.join(path.resolve(__dirname), './security.txt'), 'utf-8')
        const fileName = this.structureProject.subDir.core.libs[0]
        if (!fs.existsSync(this.pathSecurityCore))
            fs.mkdirSync(this.pathSecurityCore, { recursive: true });
        fs.writeFileSync(this.pathSecurityCore + '/' + fileName, contentBaseController);
    }

    protected createMiddlewares = (fileName?: string) => {
        const file = createFile({
            fileName: fileName == undefined ? 'middlewares.ts' : fileName,
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
            fileName: 'server.ts',
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
                    moduleSpecifier: './middlewares/middlewares',
                    defaultImportName: 'middlewares',
                    onBeforeWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('// routes controller, middlewares');
                    }
                },
                {
                    moduleSpecifier: '../../routes/routes',
                    defaultImportName: 'router'
                },
                {
                    moduleSpecifier: '../../services/routes/routes',
                    defaultImportName: 'servicesRouter',
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
                                writer.writeLine('this.app.use(this.pathDefault + \'services/\', servicesRouter);');
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

    createIndexApi() {
        const file = createFile({
            fileName: this.structureProject.subDir.files[0],
            imports: [
                {
                    moduleSpecifier: './settings/server/server',
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
        else console.log("you must initialize your project");
    }

    /**
     * 
     * @param options 0: main router 1: testing router 2: services router
     * @returns FileDefinition
     */
    protected routeIndex(options: number): FileDefinition {
        return createFile({
            fileName: this.structureProject.subDir.routes[0],
            imports: [
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router ' }],
                    onAfterWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('//#region rutes');
                        if (options == 0) {
                            writer.writeLine('import testRouter from "../testing/routes/routes";');
                            writer.writeLine('// Example');
                            writer.writeLine('//import example1Router from "./example1.route"');
                        }
                        else {
                            writer.writeLine('// Example');
                            if (options == 1)
                                writer.writeLine('//import testUserRouter from "../testing/controllers/user.test.controller"";');
                            else if (options == 2)
                                writer.writeLine('//import authRouter from "../auth/routes/routes";');
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
        })
    }

}
