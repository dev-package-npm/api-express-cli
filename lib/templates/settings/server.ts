import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from '../../config/structure-configuration.json';

const pathServer = path.resolve('') + '/' + config1.dir + '/settings/server/';

export const createServerHttp = async () => {
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

    if (!fs.existsSync(pathServer)) {
        fs.mkdirSync(pathServer, { recursive: true });
    }
    await fs.promises.writeFile(pathServer + file.fileName, file.write());
};

export const editFileServer = async () => {

}
