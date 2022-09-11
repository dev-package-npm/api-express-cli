import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { dir } from '../../config/structure-configuration.json';

const pathServer = path.resolve('') + '/' + dir + '/settings/server/';

export const createServerWs = () => {
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
                        defaultExpression: '\'/api/abrev/v1\'',
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

    if (!fs.existsSync(pathServer)) {
        fs.mkdirSync(pathServer, { recursive: true });
    }
    fs.writeFileSync(pathServer + file.fileName, file.write());
};
