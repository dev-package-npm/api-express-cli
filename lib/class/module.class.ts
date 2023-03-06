import path from 'node:path';
import fs from 'node:fs';
import promises from 'node:fs/promises';
import { createFile } from "ts-code-generator";
import { Config } from './config.class';
import Spinnies from 'spinnies';
import { Entities } from './entities.class';
import ansiColors from 'ansi-colors';
import readLine from 'readline';
import { Common } from './common.class';
import { Mixin } from 'ts-mixer';
import { Env } from './env.class';


export class Module extends Mixin(Config, Common, Env) {
    private spinnies = new Spinnies();

    private lineToAddServerWs = {
        import_server_ws: `\nimport WebsocketServer from "./${this.fileNameWsServer.split('.')[0]}";\n`,
        import_http: '\nimport http from "http";\n',
        server_property: '\n\tserver: http.Server;\n',
        server_ws: '\twsServer: WebsocketServer;\n',
        instance_server_http: '\n\t\tthis.server = new http.Server(this.app);\n',
        instance_server_ws: '\t\tthis.wsServer = new WebsocketServer(this.server);\n'
    };
    private lineToAddRouteWs = {
        import_ws_router: `\nimport wsRouter from "./websocket.${this.fileNameRoutes.split('.')[0]}";\n`,
        use_ws_router: `\ntestRouter.use('/ws', wsRouter);\n`
    };
    private filePathServerHttp = path.join(this.pathServer, this.fileNameServer);

    //#region  Websocket
    protected async initWs(answer: string) {
        try {
            const pathServerWs = path.join(this.pathServer, this.fileNameWsServer);
            if (!fs.existsSync(pathServerWs)) {
                this.spinnies.add('spinner-1', { text: ansiColors.blueBright(`Installing packages for ${answer}(Websocket) module`) });
                await this.executeTerminal('npm i socket.io');
                this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Done installation for WS(Websocket) module') });

                await this.createServerWs();
                await this.createRouteWs();
                this.createControllerWs();

            } else throw new Error(ansiColors.yellowBright('A module \'WS (SocketIo)\' has already been initialized'));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }


    protected async removeWs(answer: string) {
        try {
            this.spinnies.add('spinner-1', { text: ansiColors.blueBright(`Uninstalling packages for the ${answer} Socket.io module`) });
            await this.executeTerminal('npm r socket.io');
            this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright(`Finished uninstall for the module from ${answer} Socket.io`) });
            await this.removeServerWs();
            this.removeControllerWs();
            await this.removeRouteWs();
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async createServerWs() {
        try {
            const file = createFile({
                fileName: this.fileNameWsServer,
                imports: [
                    {
                        moduleSpecifier: 'socket.io/dist/typed-events',
                        namedImports: [
                            { name: ' DefaultEventsMap ' }
                        ],
                        onBeforeWrite: writer => writer.writeLine('//#region imports npm modules')
                    },
                    {
                        moduleSpecifier: 'socket.io',
                        defaultImportName: 'socketIo'
                    },
                    {
                        moduleSpecifier: 'http',
                        defaultImportName: 'http'
                    },
                    {
                        moduleSpecifier: '../../testing/routes/websocket.' + this.fileNameRoutes.split('.')[0],
                        namedImports: [
                            { name: ' websocketRoute ' }
                        ],
                        onBeforeWrite: writer => {
                            writer.writeLine('// Local imports');
                        },
                        onAfterWrite: writer => writer.writeLine('//#endregion')
                    }
                ],
                classes: [
                    {
                        name: 'WebsocketServer',
                        staticProperties: [
                            {
                                name: 'io',
                                type: 'socketIo.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>',
                                scope: 'public'
                            }
                        ],
                        properties: [
                            {
                                name: 'pathDefault',
                                type: 'string',
                                defaultExpression: '\'/api/abrev/v1/\'',
                                scope: 'private'
                            }
                        ],
                        constructorDef: {
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`WebsocketServer.io = new socketIo.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'],
    pingInterval: 25 * 1000,
    pingTimeout: 5000,
    maxHttpBufferSize: 100000000,
    connectTimeout: 5000,
    path: this.pathDefault + 'socket.io',
});
this.routes();`);
                            },
                            parameters: [
                                {
                                    name: 'server',
                                    type: 'http.Server'
                                }
                            ]
                        },
                        methods: [
                            {
                                scope: 'private',
                                name: 'routes',
                                onWriteFunctionBody: writer => writer.writeLine(`websocketRoute(WebsocketServer.io);
 // WebsocketServer.io.on('connection', (socket) => {
 //     console.log(socket.id);
 //     socket.on('message', data => {
 //         console.log(data);
 //         socket.emit('data', { message: 'recived', name: data.name });
 //     });
 // });`)
                            }
                        ],
                    }
                ],
                defaultExportExpression: 'WebsocketServer'
            });

            fs.writeFileSync(path.join(this.pathServer, file.fileName), file.write());

            await this.addLineCodeServerHttp();

        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async createRouteWs() {
        const file = createFile({
            fileName: 'websocket.' + this.fileNameRoutes,
            imports: [
                {
                    moduleSpecifier: 'socket.io/dist/typed-events',
                    namedImports: [
                        { name: ' DefaultEventsMap ' }
                    ],
                    onBeforeWrite: writer => writer.writeLine('//#region imports npm modules')
                },
                {
                    moduleSpecifier: 'socket.io',
                    defaultImportName: 'socketIo'
                },
                {
                    moduleSpecifier: 'express',
                    namedImports: [{ name: ' Router ' }]
                },
                {
                    moduleSpecifier: '../controllers/websocket.' + this.fileNameController.split('.')[0],
                    namedImports: [
                        { name: ' WebsocketController ' }
                    ],
                    onBeforeWrite: writer => {
                        writer.writeLine('// Local imports');
                    },
                    onAfterWrite: writer => writer.writeLine('//#endregion')
                }
            ],
            variables: [
                {
                    name: 'wsRouter',
                    type: 'Router',
                    defaultExpression: 'Router()',
                    declarationType: 'const'
                },
                {
                    name: 'websocketController',
                    type: 'websocketController',
                    defaultExpression: 'new WebsocketController()',
                    declarationType: 'const',
                    onAfterWrite: writer => {
                        writer.blankLine();
                        writer.writeLine('wsRouter.route(\'/send-message\').post(websocketController.sendMessage);');
                    }
                },
                {
                    name: 'websocketRoute',
                    declarationType: 'const',
                    defaultExpression: `(socketIo: socketIo.Server<DefaultEventsMap>) => {
    websocketController.connect(socketIo);
}`,
                    isExported: true
                }
            ],
            defaultExportExpression: 'wsRouter',
        });


        fs.writeFileSync(this.pathTestingRoute + file.fileName, file.write());
        await this.addLineRouteWs();
    }

    private createControllerWs() {
        const file = createFile({
            fileName: 'websocket.' + this.fileNameController,
            imports: [
                {
                    moduleSpecifier: 'socket.io/dist/typed-events',
                    namedImports: [
                        { name: ' DefaultEventsMap ' }
                    ],
                    onBeforeWrite: writer => writer.writeLine('//#region imports npm modules')
                },
                {
                    moduleSpecifier: 'socket.io',
                    defaultImportName: 'socketIo'
                },
                {
                    moduleSpecifier: 'express',
                    namedImports: [
                        {
                            name: ' Request'
                        },
                        {
                            name: 'Response '
                        }
                    ]
                },
                {
                    moduleSpecifier: '../../core/controllers/' + this.fileNameController.split('.')[0],
                    namedImports: [
                        {
                            name: ' Controller '
                        }
                    ]
                },
                {
                    moduleSpecifier: '../../settings/server/' + this.fileNameWsServer.split('.')[0],
                    defaultImportName: 'WebsocketServer',
                    onAfterWrite: writer => writer.writeLine('//#endregion')
                }
            ],
            classes: [
                {
                    name: 'WebsocketController',
                    isExported: true,
                    extendsTypes: ['Controller'],
                    methods: [
                        {
                            scope: 'public',
                            name: 'sendMessage',
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
                            onWriteFunctionBody: writer => writer.writeLine(`const { message } = req.body;
try {
    //#region Validate params
    const validation = await this.validateParams(req.body, { requiredParameters: { message } });
    if (validation != true)
        return res.status(400).json(this.setResponse({ text: 'Parameters are invalid', errors: validation, status: 700 }));
    //#endregion
    WebsocketServer.io.emit('message', message);
    WebsocketServer.io.emit('data', message);
    this.setResponse({ text: 'Successfully sent' }, 200);
    return res.status(this.code).json(this.response);
} catch (error: any) {
    return res.status(500).json(this.setResponse({ text: 'An unexpected error has occurred', errors: error.message, status: 801 }));
}`)
                        },
                        {
                            name: 'connect',
                            isAsync: true,
                            scope: 'public',
                            parameters: [
                                {
                                    name: 'socketIo',
                                    type: 'socketIo.Server<DefaultEventsMap>'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`socketIo.of('/connect').on('connection', (socket) => {
    console.log(socket.id);
});
socketIo.on('connection', (socket) => {
    console.log(socket.id);
    socket.on('message', data => {
        console.log(data);
        socket.emit('data', { message: 'recivido', name: data.name });
    });
});`);
                            }
                        }
                    ],
                }
            ],
        });

        fs.writeFileSync(this.pathTestingController + file.fileName, file.write().replaceAll('(req: Request, res: Response)', ' = async (req: Request, res: Response): Promise<Response> =>'));
    }

    protected isExistModuleWs(): boolean {
        return fs.existsSync(path.join(this.pathServer, this.fileNameWsServer));
    }

    protected async addLineCodeServerHttp() {
        const content = fs.createReadStream(this.filePathServerHttp, 'utf8');
        let rl = readLine.createInterface({ input: content });

        let modifiedContent = '';
        let controlWrite = false;
        controlWrite = await this.isExistsWord(rl, [this.lineToAddServerWs.import_server_ws, this.lineToAddServerWs.instance_server_http, this.lineToAddServerWs.instance_server_ws]);
        if (!controlWrite) {
            const content = fs.createReadStream(this.filePathServerHttp, 'utf8');
            rl = readLine.createInterface({ input: content });
            rl.on('line', line => {
                if (line.includes('// Local import') != false) {
                    modifiedContent += line;
                    modifiedContent += this.lineToAddServerWs.import_server_ws;
                }
                else if (line.includes('//#region imports npm modules') != false) {
                    modifiedContent += line;
                    modifiedContent += this.lineToAddServerWs.import_http;
                }
                else if (line.includes(`app: Application;`) != false) {
                    modifiedContent += line;
                    modifiedContent += this.lineToAddServerWs.server_property;
                    modifiedContent += this.lineToAddServerWs.server_ws;
                }
                else if (line.includes('this.config();') != false) {
                    modifiedContent += line;
                    modifiedContent += this.lineToAddServerWs.instance_server_http;
                    modifiedContent += this.lineToAddServerWs.instance_server_ws;
                }
                else if (line.includes(`this.app.listen(this.app.get('port'));`)) {
                    line = line.replace('app.listen', 'server.listen')
                    modifiedContent += line + '\n';
                }
                else if (line.includes(`this.app.listen(this.app.get('port'), ()`)) {
                    line = line.replace('app.listen', 'server.listen')
                    modifiedContent += line + '\n';
                }
                else modifiedContent += line + '\n';

            });
            rl.on('close', () => {
                fs.writeFileSync(this.filePathServerHttp, modifiedContent);
            });
        } else throw new Error(ansiColors.redBright(`The 'ws' module is already added to the server file`));
    }

    private async addLineRouteWs() {
        try {
            const content = fs.createReadStream(this.pathTestingRoute + this.fileNameRoutes, 'utf8');

            let rl = readLine.createInterface({ input: content });

            let modifiedContent = '';
            let controlWrite = false;
            controlWrite = await this.isExistsWord(rl, [this.lineToAddRouteWs.import_ws_router, this.lineToAddRouteWs.use_ws_router, 'wsRouter']);
            if (!controlWrite) {
                const content = fs.createReadStream(this.pathTestingRoute + this.fileNameRoutes, 'utf8');
                rl = readLine.createInterface({ input: content });
                rl.on('line', line => {
                    if (line.includes('import { Router } from "express";') != false) {
                        modifiedContent += line;
                        modifiedContent += this.lineToAddRouteWs.import_ws_router;
                    }
                    else if (line.includes('//#region  Definition of routes for tests') != false) {
                        modifiedContent += line;
                        modifiedContent += this.lineToAddRouteWs.use_ws_router;
                    }
                    else modifiedContent += line + '\n';
                });
                rl.on('close', () => {
                    fs.writeFileSync(this.pathTestingRoute + this.fileNameRoutes, modifiedContent);
                });
            } else throw new Error(ansiColors.redBright(`There is already a route associated with the name 'wsRouter'`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async removeServerWs() {
        const serverWspath = this.pathServer + this.fileNameWsServer;
        if (fs.existsSync(serverWspath)) {
            fs.rmSync(serverWspath, { recursive: true });
            await this.removeLineCodeServerHttp();
        } else throw new Error(ansiColors.yellowBright(`The 'WS (SocketIo)' module is not added`));
    }

    protected async removeLineRouteWs() {
        const content = fs.createReadStream(this.pathTestingRoute + this.fileNameRoutes, 'utf8');

        let rl = readLine.createInterface({ input: content });

        let modifiedContent = '';
        let controlWrite = false;
        controlWrite = await this.isExistsWord(rl, [this.lineToAddRouteWs.import_ws_router, this.lineToAddRouteWs.use_ws_router, 'wsRouter']);
        if (controlWrite) {
            const content = fs.createReadStream(this.pathTestingRoute + this.fileNameRoutes, 'utf8');
            rl = readLine.createInterface({ input: content });
            rl.on('line', line => {
                if (line.includes(this.lineToAddRouteWs.import_ws_router.replaceAll('\n', '')) != false)
                    modifiedContent += '';
                else if (line.includes(this.lineToAddRouteWs.use_ws_router.replaceAll('\n', '')) != false)
                    modifiedContent += '';
                else modifiedContent += line + '\n';
            });
            rl.on('close', () => {
                fs.writeFileSync(this.pathTestingRoute + this.fileNameRoutes, modifiedContent);
            });
        }
    }

    protected removeControllerWs() {
        try {
            if (fs.existsSync(this.pathTestingController + 'websocket.' + this.fileNameController)) {
                fs.rmSync(this.pathTestingController + 'websocket.' + this.fileNameController, { recursive: true });
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async removeRouteWs() {
        try {
            if (fs.existsSync(this.pathTestingRoute + 'websocket.' + this.fileNameRoutes)) {
                fs.rmSync(this.pathTestingRoute + 'websocket.' + this.fileNameRoutes, { recursive: true });
                await this.removeLineRouteWs();
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async removeLineCodeServerHttp() {
        const content = fs.createReadStream(this.filePathServerHttp, 'utf8');

        let rl = readLine.createInterface({ input: content });

        let modifiedContent = '';
        let controlWrite = false;
        controlWrite = await this.isExistsWord(rl, [this.lineToAddServerWs.import_http, this.lineToAddServerWs.import_server_ws, this.lineToAddServerWs.instance_server_http, this.lineToAddServerWs.instance_server_ws, this.lineToAddServerWs.server_property, this.lineToAddServerWs.server_ws]);
        if (controlWrite) {
            const content = fs.createReadStream(this.filePathServerHttp, 'utf8');
            rl = readLine.createInterface({ input: content });
            rl.on('line', line => {
                if (line.includes(this.lineToAddServerWs.import_http.replaceAll('\n', '').replaceAll('\t', '')) != false)
                    modifiedContent += '';
                else if (line.includes(this.lineToAddServerWs.import_server_ws.replaceAll('\n', '').replaceAll('\t', '')) != false)
                    modifiedContent += '';
                else if (line.includes(this.lineToAddServerWs.instance_server_http.replaceAll('\n', '').replaceAll('\t', '')) != false)
                    modifiedContent += '';
                else if (line.includes(this.lineToAddServerWs.instance_server_ws.replaceAll('\n', '').replaceAll('\t', '')) != false)
                    modifiedContent += '';
                else if (line.includes(this.lineToAddServerWs.server_property.replaceAll('\n', '').replaceAll('\t', '')) != false)
                    modifiedContent += '';
                else if (line.includes(this.lineToAddServerWs.server_ws.replaceAll('\n', '').replaceAll('\t', '')) != false)
                    modifiedContent += '';
                else if (line.includes(`this.server.listen(this.app.get('port'));`)) {
                    line = line.replace('server.listen', 'app.listen')
                    modifiedContent += line + '\n';
                }
                else if (line.includes(`this.server.listen(this.app.get('port'), ()`)) {
                    line = line.replace('server.listen', 'app.listen')
                    modifiedContent += line + '\n';
                }
                else modifiedContent += line + '\n';
            });
            rl.on('close', () => {
                fs.writeFileSync(this.filePathServerHttp, modifiedContent);
            });

        }
    }
    //#endregion

    //#region  Database 
    protected async initDatabase(answer: string) {
        try {
            const pathDatabase = path.join(this.pathServer, this.fileNameDatabase);
            if (!fs.existsSync(pathDatabase)) {
                this.spinnies.add('spinner-1', { text: ansiColors.blueBright('Installing packages for database mysql module') });
                await this.executeTerminal('npm i promise-mysql');
                this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Done installation for database mysql module') });
                fs.mkdirSync(this.pathCoreModel, { recursive: true });
                fs.mkdirSync(this.pathModel, { recursive: true });

                await this.createDatabase();
                this.createModelCore();
            } else throw new Error(ansiColors.yellowBright(`A module \'${answer} (mysql)\' has already been initialized`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async removeDatabase(answer: string) {
        try {
            const pathDatabase = path.join(this.pathSettings, this.fileNameDatabase);
            if (fs.existsSync(pathDatabase) && fs.readdirSync(this.pathModel).length == 0) {
                if (fs.existsSync(pathDatabase)) {
                    this.spinnies.add('spinner-1', { text: ansiColors.blueBright(`Uninstalling packages for the myslq database module}`) });
                    await this.executeTerminal('npm r promise-mysql');
                    this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Finished uninstall for the module from database msyql') });
                    if (fs.existsSync(pathDatabase)) await promises.unlink(pathDatabase);

                    if (fs.existsSync(this.pathCoreModel + this.fileNameModel)) {
                        fs.rmSync(this.pathCoreModel + this.fileNameModel, { recursive: true });
                        if (fs.readdirSync(this.pathModel).length == 0)
                            fs.rmdirSync(this.pathModel);
                        if (fs.readdirSync(this.pathCoreModel).length == 0)
                            fs.rmdirSync(this.pathCoreModel);
                        await this.removeLineEnv();
                    };
                } else throw new Error(ansiColors.yellowBright(`The \'${answer} (mysql)\' module is not added`));
            }
            else if (!fs.existsSync(this.pathModel) && !fs.existsSync(pathDatabase))
                throw new Error(ansiColors.yellowBright(`The '${answer}' module is not added`))
            else
                throw new Error(ansiColors.yellowBright(`Could not delete module, because there are model files.${ansiColors.blueBright(' (Delete manually)')}`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async createDatabase() {
        try {
            const file = createFile({
                fileName: this.fileNameDatabase,
                imports: [
                    {
                        moduleSpecifier: 'promise-mysql',
                        namedImports: [
                            {
                                name: ' PoolConfig ',
                            }
                        ],
                        defaultImportName: 'mysql'
                    }
                ],
                classes: [
                    {
                        name: 'Database',
                        properties: [
                            {
                                name: 'config',
                                scope: 'protected',
                                type: 'PoolConfig'
                            }
                        ],
                        constructorDef: {
                            parameters: [
                                {
                                    name: 'config',
                                    type: 'PoolConfig',
                                    isOptional: true
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`if (config != undefined) {
    this.config = config;
} else {
    this.config = {
        connectionLimit: 113,
        host: process.env[\`HOST_DB_\${String(process.env.NODE_ENV).toUpperCase()}\`],
        user: process.env[\`USER_DB_\${String(process.env.NODE_ENV).toUpperCase()}\`],
        password: process.env[\`USER_PASSWORD_\${String(process.env.NODE_ENV).toUpperCase()}\`],
        database: process.env[\`DB_NAME_\${String(process.env.NODE_ENV).toUpperCase()}\`],
        multipleStatements: true,
        charset: 'utf8mb4'
    };
}`);
                            }
                        },
                        methods: [
                            {
                                name: 'connect',
                                scope: 'public',
                                isAsync: true,
                                returnType: 'Promise<PoolConnection>',
                                parameters: [
                                    {
                                        name: 'config',
                                        type: 'PoolConfig = this.config'
                                    }
                                ],
                                onWriteFunctionBody: writer => {
                                    writer.writeLine(`try {
    const pool = await mysql.createPool(config);
    return await pool.getConnection();
} catch (error: any) {
    throw new Error("Database: " + error.message);
}`);
                                }
                            }
                        ]
                    }
                ],

                defaultExportExpression: 'Database'
            });

            fs.writeFileSync(path.join(this.pathSettings, this.fileNameDatabase), file.write());
            await this.addLineEnv();
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private createModelCore() {
        const file = createFile({
            fileName: this.fileNameModel,
            imports: [
                {
                    moduleSpecifier: '../../settings/' + this.fileNameDatabase.split('.')[0],
                    defaultImportName: 'Database'
                }
            ],
            interfaces: [
                {
                    name: 'IQuerySelect',
                    properties: [
                        {
                            name: 'select',
                            type: 'Array<any>',
                        },
                        {
                            name: 'where',
                            type: 'any'
                        }
                    ],
                    onBeforeWrite: writer => writer.writeLine('//#region Interface'),
                },
                {
                    name: 'ISelectReturn',
                    properties: [
                        {
                            name: 'array',
                            type: 'boolean',
                            isOptional: true
                        }
                    ],
                    onAfterWrite: writer => writer.writeLine('//#endregion'),
                }
            ],
            classes: [
                {
                    onBeforeWrite: writer => writer.writeLine('const database = new Database();').blankLine(),
                    name: 'Model',
                    isAbstract: true,
                    isExported: true,
                    properties: [
                        {
                            name: 'table: string',
                            type: 'string',
                            defaultExpression: '\'\'',
                            scope: 'protected'
                        },
                        {
                            name: 'primaryKey: string',
                            type: 'string',
                            defaultExpression: '\'id\'',
                            scope: 'protected'
                        },
                        {
                            name: 'fields: Array<string>',
                            type: 'Array<string>',
                            defaultExpression: '[]',
                            scope: 'protected'
                        },
                        {
                            name: 'database',
                            type: 'Database',
                            scope: 'protected'
                        }
                    ],
                    constructorDef: {
                        parameters: [
                            {
                                name: 'table',
                                type: 'string'
                            },
                            {
                                name: 'primaryKey',
                                type: 'string'
                            },
                            {
                                name: 'fields',
                                type: 'Array<string>'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`this.table = table;
this.primaryKey = primaryKey;
this.fields = fields;
this.database = database;`);
                        }
                    },
                    methods: [
                        {
                            name: 'executeQuery',
                            isAsync: true,
                            scope: 'public',
                            parameters: [
                                {
                                    name: 'sentence',
                                    type: 'string'
                                },
                                {
                                    name: 'values',
                                    isOptional: true,
                                    type: 'any'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`try {
    const connected = await this.database.connect();
    const results = await connected.query(sentence, values);
    connected.release();
    connected.destroy();
    return results;
} catch (error: any) {
    throw new Error(error.message);
}`);
                            }
                        },
                        {
                            name: 'create',
                            isAsync: true,
                            scope: 'public',
                            parameters: [
                                {
                                    name: 'data',
                                    type: 'object | Array<any>'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToInsert(data);
return await this.executeQuery(sqlQuery);`);
                            }
                        },
                        {
                            name: 'select',
                            typeParameters: [
                                {
                                    name: 'T'
                                }
                            ],
                            returnType: 'Promise<T | Array<any>>',
                            isAsync: true,
                            scope: 'public',
                            parameters: [
                                {
                                    name: 'value',
                                    isOptional: true,
                                    type: 'Partial<IQuerySelect>'
                                },
                                {
                                    name: 'condition',
                                    isOptional: true,
                                    type: 'ISelectReturn'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToSelect(value?.select || [], value?.where);
const resultQuery = await this.executeQuery(sqlQuery);
return condition?.array != undefined && condition?.array == true ? resultQuery : resultQuery.length > 1 ? resultQuery : resultQuery[0];`);
                            }
                        },
                        {
                            name: 'update',
                            isAsync: true,
                            scope: 'public',
                            parameters: [
                                {
                                    name: 'data',
                                    type: 'object'
                                },
                                {
                                    name: 'where',
                                    type: 'object'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToUpdate(data, where);
return await this.executeQuery(sqlQuery);`);
                            }
                        },
                        {
                            name: 'delete',
                            isAsync: true,
                            scope: 'public',
                            parameters: [
                                {
                                    name: 'where',
                                    type: 'object'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToDelete(where);
return await this.executeQuery(sqlQuery);`);
                            }
                        },
                        {
                            name: 'truncate',
                            returnType: ' Promise<any>',
                            isAsync: true,
                            scope: 'public',
                            onWriteFunctionBody(writer) {
                                writer.writeLine(`const sqlQuery: string = \`TRUNCATE TABLE \${this.table}\`;
return await this.executeQuery(sqlQuery);`);
                            },
                        },
                        {
                            name: 'fillSqlQueryToSelect',
                            scope: 'protected',
                            parameters: [
                                {
                                    name: 'data',
                                    type: 'Array<any>'
                                },
                                {
                                    name: 'where',
                                    type: 'any'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`let sqlQuery: string = 'SELECT ';
if (data !== undefined && data.length !== 0) {
    for (const key in data) {
        sqlQuery += \`\${this.table}.\${data[key]},\`
    }
    sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
}
else {
    sqlQuery += ' *';
}
sqlQuery += \` FROM \${this.table}\`;
sqlQuery += this.fillSqlQueryToWhere(where);
return sqlQuery;`);
                            }
                        },
                        {
                            name: 'fillSqlQueryToInsert',
                            scope: 'protected',
                            parameters: [
                                {
                                    name: 'data',
                                    type: 'any'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`if (Array.isArray(data)) {
    if (data.length > 0) {
        if (Object.entries(data[0]).length !== 0) {
            let sqlQuery: string = \`\${this.table}(\`;
            for (const key in data[0]) {
                sqlQuery += \`\\\`\${key}\\\`,\`;
            }
            sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
            sqlQuery += ') VALUES';
            for (const iterator of data) {
                if (Object.entries(iterator).length !== 0) {
                    sqlQuery += '('
                    for (const key in data[0]) {
                        sqlQuery += \`'\${iterator[key]}',\`;
                    }
                    sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
                    sqlQuery += '),';
                } else
                    throw new Error('parameters cannot be empty');
            }
            sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
            return \`INSERT INTO \${sqlQuery}\`;
        }
        else
            throw new Error('parameters cannot be empty');
    }
    else
        throw new Error('parameters cannot be empty');
}
else {
    if (Object.entries(data).length !== 0) {
        let sqlQuery: string = \`\${this.table}(\`;
        for (const key in data) {
            sqlQuery += \`\\\`\${key}\\\`,\`;
        }
        sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
        sqlQuery += ') VALUES(';
        for (const key in data) {
            sqlQuery += \`'\${data[key]}',\`;
        }
        sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
        sqlQuery += ')';
        return \`INSERT INTO \${sqlQuery}\`;
    } else
        throw new Error('parameters cannot be empty');
}`);
                            }
                        },
                        {
                            name: 'fillSqlQueryToUpdate',
                            scope: 'protected',
                            parameters: [
                                {
                                    name: 'data',
                                    type: 'any'
                                },
                                {
                                    name: 'where',
                                    type: 'any'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`const value: any = data;
const valueWhere: any = where;
let sqlQuery: string = '';
if (Object.entries(value).length !== 0 && Object.entries(valueWhere).length !== 0) {
    for (const key in value) {
        sqlQuery += \`\${this.table}.\${key}='\${value[key]}',\`;
    }
    sqlQuery = \`UPDATE \${this.table} SET \${sqlQuery.slice(0, sqlQuery.length - 1)} WHERE \`;
    for (const key in valueWhere) {
        sqlQuery += \`\${this.table}.\${key}='\${valueWhere[key]}' AND \`;
    }
    sqlQuery = sqlQuery.slice(0, sqlQuery.length - 5);
    return sqlQuery;
}
throw new Error("parameters cannot be empty");`);
                            }
                        },
                        {
                            name: 'fillSqlQueryToDelete',
                            scope: 'protected',
                            parameters: [
                                {
                                    name: 'where',
                                    type: 'any'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`let sqlQuery: string = \`DELETE FROM \${this.table}\`;
sqlQuery += this.fillSqlQueryToWhere(where);
return sqlQuery;`);
                            }
                        },
                        {
                            name: 'fillSqlQueryToWhere',
                            scope: 'private',
                            parameters: [
                                {
                                    name: 'valueWhere',
                                    type: 'any'
                                }
                            ],
                            onWriteFunctionBody: writer => {
                                writer.writeLine(`let sqlQuery: string = ' WHERE ';
if (valueWhere !== undefined) {
    if (Object.entries(valueWhere).length !== 0) {
        for (const key in valueWhere) {
            sqlQuery += \`\${this.table}.\${key}='\${valueWhere[key]}' AND \`;
        }
        sqlQuery = sqlQuery.slice(0, sqlQuery.length - 5);
        return sqlQuery;
    }
}
return '';`);
                            }
                        },
                    ]
                }
            ]

        });
        fs.writeFileSync(this.pathCoreModel + file.fileName, file.write().replace('(value?: Partial<IQuerySelect>, condition?: ISelectReturn)', '(value?: Partial<IQuerySelect>, condition?: ISelectReturn): Promise<T'));
    }

    protected isExistModuleDatabase(): boolean {
        return fs.existsSync(path.join(this.pathSettings, this.fileNameDatabase)) && fs.existsSync(this.pathCoreModel + this.fileNameModel);
    }

    //#endregion
}