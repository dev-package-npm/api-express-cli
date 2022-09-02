import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
const pathServer = path.resolve('') + '/src/settings/server/';

export const createServerHttp = () => {
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
                defaultImportName: 'express'
            },
            {
                moduleSpecifier: 'http',
                defaultImportName: 'http',
                onAfterWrite: writer => {
                    writer.writeLine('//Local import');
                    writer.writeLine('//#endregion');
                }
            },
            {
                moduleSpecifier: './middlewares/middlewares',
                defaultImportName: 'middlewares',
                onBeforeWrite: writer => {
                    writer.writeLine('//#region routes controller, middlewares');
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
                    },
                    {
                        name: 'server',
                        type: 'http.Server'
                    }
                ],
                constructorDef: {
                    onWriteFunctionBody: writer => {
                        writer.writeLine('this.app = express();');
                        writer.writeLine('this.config();');
                        writer.writeLine('this.server = new http.Server(this.app);');
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
                        onWriteFunctionBody: writer => writer.writeLine('this.app.listen(this.app.get(\'port\'));')
                    }
                ],
            }
        ],
        defaultExportExpression: 'Server'
    });

    if (!fs.existsSync(pathServer)) {
        fs.mkdirSync(pathServer, { recursive: true });
    }
    fs.writeFileSync(pathServer + file.fileName, file.write());
};
