import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from '../../config/structure-configuration.json';

const pathControllerWs = path.resolve('') + '/' + config1.dir + '/testing/controllers/';

export const createControllerWs = () => {
    const file = createFile({
        fileName: 'websocket.controller.ts',
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
                moduleSpecifier: '../../core/helpers/request-http-params.helper',
                namedImports: [
                    { name: ' validateParams ' }
                ],
                onBeforeWrite: writer => {
                    writer.writeLine('// Local imports');
                }
            },
            {
                moduleSpecifier: '../../core/helpers/response-http.helper',
                namedImports: [
                    { name: ' IResponse' },
                    { name: 'setResponse ' }
                ]
            },
            {
                moduleSpecifier: '../../settings/server/ws-server',
                defaultImportName: 'WebsocketServer',
                onAfterWrite: writer => writer.writeLine('//#endregion')
            }
        ],
        classes: [
            {
                name: 'WebsocketController',
                isExported: true,
                staticProperties: [
                    {
                        name: 'response: IResponse',
                        scope: 'private',
                        defaultExpression: ' setResponse({})'
                    },
                    {
                        name: 'code: number',
                        defaultExpression: '200',
                        scope: 'private'
                    }
                ],
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
                        isAsync: true,
                        onWriteFunctionBody: writer => writer.writeLine(`const { message } = req.body;
try {
    //#region Validate params
    const validation = await validateParams(req.body, { requiredParameters: { message } });
    if (validation != true)
        return res.status(400).json(setResponse({ text: 'Parameters are invalid', errors: validation, status: 700 }));
    //#endregion
    WebsocketServer.io.emit('message', message);
    WebsocketServer.io.emit('data', message);
    WebsocketController.response = setResponse({ text: 'Successfully sent' });
    return res.status(WebsocketController.code).json(WebsocketController.response);
} catch (error: any) {
    return res.status(500).json(setResponse({
        text: 'An unexpected error has occurred', errors: error.message, status: 801
    }));
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

    if (!fs.existsSync(pathControllerWs)) {
        fs.mkdirSync(pathControllerWs, { recursive: true });
    }
    fs.writeFileSync(pathControllerWs + file.fileName, file.write());
};
