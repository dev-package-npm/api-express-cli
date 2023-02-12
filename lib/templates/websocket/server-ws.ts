import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
import readLine from 'readline';

// Local
import { config1 } from '../../config/structure-configuration.json';
import { isExistsWord } from "../../functions/common";
import ansiColors from "ansi-colors";

export const pathServerWs = path.resolve('') + '/' + config1.dir + '/settings/server/';
let lineToAdd = {
    import_server_ws: '\nimport WebsocketServer from "./ws-server";\n',
    import_http: '\nimport http from "http";\n',
    server_property: '\n\tserver: http.Server;\n',
    server_ws: '\twsServer: WebsocketServer;\n',
    instance_server_http: '\n\t\tthis.server = new http.Server(this.app);\n',
    instance_server_ws: '\t\tthis.wsServer = new WebsocketServer(this.server);\n'

};
let serverWsPaht = pathServerWs + config1.subDir.settings.server.files[1];

export const createServerWs = async () => {
    const file = createFile({
        fileName: 'ws-server.ts',
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
                moduleSpecifier: '../../testing/routes/websocket.route',
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

    if (!fs.existsSync(pathServerWs)) {
        fs.mkdirSync(pathServerWs, { recursive: true });
    }
    fs.writeFileSync(pathServerWs + file.fileName, file.write());

    await addLineCodeServerHttp();
};

export const removeServerWs = async () => {
    if (fs.existsSync(serverWsPaht)) {
        fs.rmSync(serverWsPaht, { recursive: true });
        await removeLineCodeServerHttp();
    } else console.log(ansiColors.yellowBright(`The 'WS (SocketIo)' module is not added`));
}

export const isExistModuleWs = (): boolean => {
    return fs.existsSync(serverWsPaht);
}

const addLineCodeServerHttp = async () => {
    const content = fs.createReadStream(pathServerWs + 'server.ts', 'utf8');
    let rl = readLine.createInterface({ input: content });

    let modifiedContent = '';
    let controlWrite = false;
    controlWrite = await isExistsWord(rl, [lineToAdd.import_server_ws, lineToAdd.instance_server_http, lineToAdd.instance_server_ws]);
    if (!controlWrite) {
        const content = fs.createReadStream(pathServerWs + 'server.ts', 'utf8');
        rl = readLine.createInterface({ input: content });
        rl.on('line', line => {
            if (line.includes('// Local import') != false) {
                modifiedContent += line;
                modifiedContent += lineToAdd.import_server_ws;
            }
            else if (line.includes('//#region imports npm modules') != false) {
                modifiedContent += line;
                modifiedContent += lineToAdd.import_http;
            }
            else if (line.includes(`app: Application;`) != false) {
                modifiedContent += line;
                modifiedContent += lineToAdd.server_property;
                modifiedContent += lineToAdd.server_ws;
            }
            else if (line.includes('this.config();') != false) {
                modifiedContent += line;
                modifiedContent += lineToAdd.instance_server_http;
                modifiedContent += lineToAdd.instance_server_ws;
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
            fs.writeFileSync(pathServerWs + 'server.ts', modifiedContent);
        });
    } else console.log(ansiColors.redBright(`The 'ws' module is already added to the server file`));

    // exec('npm i socket.io', async (error, stdout, stderr) => {
    //     if (!error && stdout != '' && !stderr) {
    //         createServerWs();
    //         createRouteWs();
    //         createControllerWs();
    //         // Edit server http, import and inicialize
    //         const pathServer = path.resolve('') + '/' + config1.dir + '/settings/server/';

    //         const content = fs.createReadStream(pathServer + 'server.ts', 'utf8');
    //         let rl = readLine.createInterface({ input: content });
    //         let lineToAdd = {
    //             import_server_ws: '\nimport WebsocketServer from "./ws-server";\n',
    //             import_http: '\nimport http from "http";\n',
    //             server_property: '\n\tserver: http.Server;\n',
    //             server_ws: '\twsServer: WebsocketServer;\n',
    //             instance_server_http: '\n\t\tthis.server = new http.Server(this.app);\n',
    //             instance_server_ws: '\t\tthis.wsServer = new WebsocketServer(this.server);\n'

    //         };
    //         let modifiedContent = '';
    //         let controlWrite = false;
    //         controlWrite = await isExistsWord(rl, [lineToAdd.import_server_ws, lineToAdd.instance_server_http, lineToAdd.instance_server_ws]);
    //         if (!controlWrite) {
    //             const content = fs.createReadStream(pathServer + 'server.ts', 'utf8');
    //             rl = readLine.createInterface({ input: content });
    //             rl.on('line', line => {
    //                 if (line.includes('// Local import') != false) {
    //                     modifiedContent += line;
    //                     modifiedContent += lineToAdd.import_server_ws;
    //                 }
    //                 else if (line.includes('//#region imports npm modules') != false) {
    //                     modifiedContent += line;
    //                     modifiedContent += lineToAdd.import_http;
    //                 }
    //                 else if (line.includes(`app: Application;`) != false) {
    //                     modifiedContent += line;
    //                     modifiedContent += lineToAdd.server_property;
    //                     modifiedContent += lineToAdd.server_ws;
    //                 }
    //                 else if (line.includes('this.config();') != false) {
    //                     modifiedContent += line;
    //                     modifiedContent += lineToAdd.instance_server_http;
    //                     modifiedContent += lineToAdd.instance_server_ws;
    //                 }
    //                 else if (line.includes(`this.app.listen(this.app.get('port'));`)) {
    //                     line = line.replace('app.listen', 'server.listen')
    //                     modifiedContent += line + '\n';
    //                 }
    //                 else if (line.includes(`this.app.listen(this.app.get('port'), ()`)) {
    //                     line = line.replace('app.listen', 'server.listen')
    //                     modifiedContent += line + '\n';
    //                 }
    //                 else modifiedContent += line + '\n';

    //             });
    //             rl.on('close', () => {
    //                 fs.writeFileSync(pathServer + 'server.ts', modifiedContent);
    //             });
    //         } else console.log(ansiColors.redBright(`The '${answer}' module is already added to the server file`));

    //     }
    //     else
    //         console.log(error || stderr);
    // });
}

const removeLineCodeServerHttp = async () => {
    const content = fs.createReadStream(pathServerWs + 'server.ts', 'utf8');

    let rl = readLine.createInterface({ input: content });

    let modifiedContent = '';
    let controlWrite = false;
    controlWrite = await isExistsWord(rl, [lineToAdd.import_http, lineToAdd.import_server_ws, lineToAdd.instance_server_http, lineToAdd.instance_server_ws, lineToAdd.server_property, lineToAdd.server_ws]);
    if (controlWrite) {
        const content = fs.createReadStream(pathServerWs + 'server.ts', 'utf8');
        rl = readLine.createInterface({ input: content });
        rl.on('line', line => {
            if (line.includes(lineToAdd.import_http.replaceAll('\n', '').replaceAll('\t', '')) != false)
                modifiedContent += '';
            else if (line.includes(lineToAdd.import_server_ws.replaceAll('\n', '').replaceAll('\t', '')) != false)
                modifiedContent += '';
            else if (line.includes(lineToAdd.instance_server_http.replaceAll('\n', '').replaceAll('\t', '')) != false)
                modifiedContent += '';
            else if (line.includes(lineToAdd.instance_server_ws.replaceAll('\n', '').replaceAll('\t', '')) != false)
                modifiedContent += '';
            else if (line.includes(lineToAdd.server_property.replaceAll('\n', '').replaceAll('\t', '')) != false)
                modifiedContent += '';
            else if (line.includes(lineToAdd.server_ws.replaceAll('\n', '').replaceAll('\t', '')) != false)
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
            fs.writeFileSync(pathServerWs + 'server.ts', modifiedContent);
        });

    }
}

