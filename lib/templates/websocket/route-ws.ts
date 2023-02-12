import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
import readLine from 'readline';

// Local
import { config1 } from '../../config/structure-configuration.json';
import { isExistsWord } from "../../functions/common";
import ansiColors from "ansi-colors";

const pathRouteWs = path.resolve('') + '/' + config1.dir + '/testing/routes/';
let lineToAdd = {
    import_ws_router: '\nimport wsRouter from "./websocket.route";\n',
    use_ws_router: `\ntestRouter.use('ws', wsRouter);\n`
};

export const createRouteWs = async () => {
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
                        name: ' Router',
                    },
                    {
                        name: 'Request'
                    },
                    {
                        name: 'Response '
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
                name: 'websocketController',
                type: 'websocketController',
                defaultExpression: 'new WebsocketController()',
                declarationType: 'const',
                onAfterWrite: writer => {
                    writer.blankLine();
                    writer.writeLine('wsRouter.route(\'/send-message\').post((req: Request, res: Response) => websocketController.sendMessage(req, res));');
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

    if (!fs.existsSync(pathRouteWs)) {
        fs.mkdirSync(pathRouteWs, { recursive: true });
    }
    fs.writeFileSync(pathRouteWs + file.fileName, file.write());
    await addLineRoute();
};

export const removeRouteWs = async () => {
    if (fs.existsSync(pathRouteWs + 'websocket.route.ts')) {
        fs.rmSync(pathRouteWs + 'websocket.route.ts', { recursive: true });
        await removeLineRoute();
    }
}

const addLineRoute = async () => {
    const content = fs.createReadStream(pathRouteWs + 'routes.ts', 'utf8');

    let rl = readLine.createInterface({ input: content });

    let modifiedContent = '';
    let controlWrite = false;
    controlWrite = await isExistsWord(rl, [lineToAdd.import_ws_router, lineToAdd.use_ws_router, 'wsRouter']);
    if (!controlWrite) {
        const content = fs.createReadStream(pathRouteWs + 'routes.ts', 'utf8');
        rl = readLine.createInterface({ input: content });
        rl.on('line', line => {
            if (line.includes('import { Router } from "express";') != false) {
                modifiedContent += line;
                modifiedContent += lineToAdd.import_ws_router;
            }
            else if (line.includes('//#region  Definition of routes for tests') != false) {
                modifiedContent += line;
                modifiedContent += lineToAdd.use_ws_router;
            }
            else modifiedContent += line + '\n';
        });
        rl.on('close', () => {
            fs.writeFileSync(pathRouteWs + 'routes.ts', modifiedContent);
        });
    } else console.log(ansiColors.redBright(`There is already a route associated with the name 'wsRouter'`));
}

const removeLineRoute = async () => {
    const content = fs.createReadStream(pathRouteWs + 'routes.ts', 'utf8');

    let rl = readLine.createInterface({ input: content });

    let modifiedContent = '';
    let controlWrite = false;
    controlWrite = await isExistsWord(rl, [lineToAdd.import_ws_router, lineToAdd.use_ws_router, 'wsRouter']);
    if (controlWrite) {
        const content = fs.createReadStream(pathRouteWs + 'routes.ts', 'utf8');
        rl = readLine.createInterface({ input: content });
        rl.on('line', line => {
            if (line.includes(lineToAdd.import_ws_router.replaceAll('\n', '')) != false)
                modifiedContent += '';
            else if (line.includes(lineToAdd.use_ws_router.replaceAll('\n', '')) != false)
                modifiedContent += '';
            else modifiedContent += line + '\n';
        });
        rl.on('close', () => {
            fs.writeFileSync(pathRouteWs + 'routes.ts', modifiedContent);
        });
    }
}