import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { dir } from '../../config/structure-configuration.json';

const pathMiddleware = path.resolve() + '/' + dir + '/settings/server/middlewares/';
export const createMiddlewares = (fileName?: string) => {
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
                defaultImportName: 'morgan'
            },
            {
                moduleSpecifier: 'dotenv',
                defaultImportName: 'dotenv',
                onAfterWrite: writer => {
                    writer.blankLine();
                    writer.writeLine('const middlewares = async (app: Application): Promise<void> => {')
                        .indent().write('dotenv.config();')
                        .newLine().indent().write('app.set(\'port\', process.env.PORT || 4000);')
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

    if (!fs.existsSync(pathMiddleware))
        fs.mkdirSync(pathMiddleware, { recursive: true });
    fs.writeFileSync(pathMiddleware + file.fileName, file.write());
};
