import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { dir } from '../../config/structure-configuration.json';

const pathRouteWs = path.resolve('') + '/' + dir + '/testing/routes/';

export const createRouteWs = () => {
    const file = createFile({
        fileName: 'websocket.route.ts',
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
                        name: ' Router '
                    }
                ]
            },
            {
                moduleSpecifier: '../controllers/websocket.controller',
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
                name: 'websocket',
                type: 'Websocket',
                defaultExpression: 'new WebsocketController()',
                declarationType: 'const',
                onAfterWrite: writer => {
                    writer.blankLine();
                    writer.writeLine('wsRouter.route(\'/send-message\').post(websocket.sendMessage);');
                }
            },
            {
                name: 'websocketRoute',
                declarationType: 'const',
                defaultExpression: `(socketIo: socketIo.Server<DefaultEventsMap>) => {
    websocket.connect(socketIo);
}`,
                isExported: true
            }
        ],
        defaultExportExpression: 'wsRouter',
    });

    if (!fs.existsSync(pathRouteWs)) {
        fs.mkdirSync(pathRouteWs, { recursive: true });
    }
    fs.writeFileSync(pathRouteWs + file.fileName, file.write());
};
