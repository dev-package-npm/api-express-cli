import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';

const pathDatabase = path.resolve() + '/src/settings/';

export const createDatabase = (fileName?: string) => {
    const file = createFile({
        fileName: fileName == undefined ? 'database.ts' : fileName,
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
                staticProperties: [
                    {
                        name: 'config',
                        scope: 'protected',
                        type: 'PoolConfig',
                    }
                ],
                constructorDef: {
                    onWriteFunctionBody: writer => {
                        writer.writeLine(`Database.config = {
    connectionLimit: 113,
    host: process.env.HOST_DB || 'localhost',
    user: process.env.USER_DB || 'root',
    password: process.env.USER_PASSWORD || '',
    database: process.env.DB_NAME || 'testing',
    multipleStatements: true
};`);
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
                                type: 'PoolConfig = Database.config'
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

    if (!fs.existsSync(pathDatabase))
        fs.mkdirSync(pathDatabase, { recursive: true });
    fs.writeFileSync(pathDatabase + file.fileName, file.write());
};
