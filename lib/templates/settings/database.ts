import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from '../../config/structure-configuration.json';
import { pathModelCore } from "../core/models/model-core";
import { addLineEnv } from "../env";

export const pathDatabase = path.resolve() + '/' + config1.dir + '/settings/';

export const createDatabase = async (fileName?: string) => {
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
        multipleStatements: true
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

    if (!fs.existsSync(pathDatabase))
        fs.mkdirSync(pathDatabase, { recursive: true });
    fs.writeFileSync(pathDatabase + file.fileName, file.write());
    await addLineEnv();
};

export const isExistModuleDatabase = (): boolean => {
    return fs.existsSync(pathDatabase + 'database.ts') && fs.existsSync(pathModelCore + config1.subDir.core.models[0]);
}