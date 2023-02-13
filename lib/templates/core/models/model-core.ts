import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from '../../../config/structure-configuration.json';

export const pathModelCore = path.resolve() + '/' + config1.dir + '/core/models/';

export const createModelCore = () => {
    const file = createFile({
        fileName: config1.subDir.core.models[0],
        imports: [
            {
                moduleSpecifier: '../../settings/database',
                defaultImportName: 'Database'
            }
        ],
        interfaces: [
            {
                name: 'IQuerySelect',
                properties: [
                    {
                        name: 'select',
                        type: 'Array<any>',
                    },
                    {
                        name: 'where',
                        type: 'any'
                    }
                ],
                onBeforeWrite: writer => writer.writeLine('//#region Interface'),
            },
            {
                name: 'ISelectReturn',
                properties: [
                    {
                        name: 'array',
                        type: 'boolean',
                        isOptional: true
                    }
                ],
                onAfterWrite: writer => writer.writeLine('//#endregion'),
            }
        ],
        classes: [
            {
                onBeforeWrite: writer => writer.writeLine('const database = new Database();').blankLine(),
                name: 'Model',
                isAbstract: true,
                isExported: true,
                properties: [
                    {
                        name: 'table: string',
                        type: 'string',
                        defaultExpression: '\'\'',
                        scope: 'protected'
                    },
                    {
                        name: 'primaryKey: string',
                        type: 'string',
                        defaultExpression: '\'id\'',
                        scope: 'protected'
                    },
                    {
                        name: 'fields: Array<string>',
                        type: 'Array<string>',
                        defaultExpression: '[]',
                        scope: 'protected'
                    },
                    {
                        name: 'database',
                        type: 'Database',
                        scope: 'protected'
                    }
                ],
                constructorDef: {
                    parameters: [
                        {
                            name: 'table',
                            type: 'string'
                        },
                        {
                            name: 'primaryKey',
                            type: 'string'
                        },
                        {
                            name: 'fields',
                            type: 'Array<string>'
                        }
                    ],
                    onWriteFunctionBody: writer => {
                        writer.writeLine(`this.table = table;
this.primaryKey = primaryKey;
this.fields = fields;
this.database = database;`);
                    }
                },
                methods: [
                    {
                        name: 'executeQuery',
                        isAsync: true,
                        scope: 'public',
                        parameters: [
                            {
                                name: 'sentence',
                                type: 'string'
                            },
                            {
                                name: 'values',
                                isOptional: true,
                                type: 'any'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`try {
    const connected = await this.database.connect();
    const results = await connected.query(sentence, values);
    connected.release();
    connected.destroy();
    return results;
} catch (error: any) {
    throw new Error(error);
}`);
                        }
                    },
                    {
                        name: 'create',
                        isAsync: true,
                        scope: 'public',
                        parameters: [
                            {
                                name: 'data',
                                type: 'object | Array<any>'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToInsert(data);
return await this.executeQuery(sqlQuery);`);
                        }
                    },
                    {
                        name: 'select',
                        typeParameters: [
                            {
                                name: 'T'
                            }
                        ],
                        returnType: 'Promise<T | Array<any>>',
                        isAsync: true,
                        scope: 'public',
                        parameters: [
                            {
                                name: 'value',
                                isOptional: true,
                                type: 'Partial<IQuerySelect>'
                            },
                            {
                                name: 'condition',
                                isOptional: true,
                                type: 'ISelectReturn'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToSelect(value?.select || [], value?.where);
const resultQuery = await this.executeQuery(sqlQuery);
return condition?.array != undefined && condition?.array == true ? resultQuery : resultQuery.length > 1 ? resultQuery : resultQuery[0];`);
                        }
                    },
                    {
                        name: 'update',
                        isAsync: true,
                        scope: 'public',
                        parameters: [
                            {
                                name: 'data',
                                type: 'object'
                            },
                            {
                                name: 'where',
                                type: 'object'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToUpdate(data, where);
return await this.executeQuery(sqlQuery);`);
                        }
                    },
                    {
                        name: 'delete',
                        isAsync: true,
                        scope: 'public',
                        parameters: [
                            {
                                name: 'where',
                                type: 'object'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`const sqlQuery: string = this.fillSqlQueryToDelete(where);
return await this.executeQuery(sqlQuery);`);
                        }
                    },
                    {
                        name: 'truncate',
                        returnType: ' Promise<any>',
                        isAsync: true,
                        scope: 'public',
                        onWriteFunctionBody(writer) {
                            writer.writeLine(`const sqlQuery: string = \`TRUNCATE TABLE \${this.table}\`;
return await this.executeQuery(sqlQuery);`);
                        },
                    },
                    {
                        name: 'fillSqlQueryToSelect',
                        scope: 'protected',
                        parameters: [
                            {
                                name: 'data',
                                type: 'Array<any>'
                            },
                            {
                                name: 'where',
                                type: 'any'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`let sqlQuery: string = 'SELECT ';
if (data !== undefined && data.length !== 0) {
    for (const key in data) {
        sqlQuery += \`\${this.table}.\${data[key]},\`
    }
    sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
}
else {
    sqlQuery += ' *';
}
sqlQuery += \` FROM \${this.table}\`;
sqlQuery += this.fillSqlQueryToWhere(where);
return sqlQuery;`);
                        }
                    },
                    {
                        name: 'fillSqlQueryToInsert',
                        scope: 'protected',
                        parameters: [
                            {
                                name: 'data',
                                type: 'any'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`if (Array.isArray(data)) {
    if (data.length > 0) {
        if (Object.entries(data[0]).length !== 0) {
            let sqlQuery: string = \`\${this.table}(\`;
            for (const key in data[0]) {
                sqlQuery += \`\\\`\${key}\\\`,\`;
            }
            sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
            sqlQuery += ') VALUES';
            for (const iterator of data) {
                if (Object.entries(iterator).length !== 0) {
                    sqlQuery += '('
                    for (const key in data[0]) {
                        sqlQuery += \`'\${iterator[key]}',\`;
                    }
                    sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
                    sqlQuery += '),';
                } else
                    throw new Error('parameters cannot be empty');
            }
            sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
            return \`INSERT INTO \${sqlQuery}\`;
        }
        else
            throw new Error('parameters cannot be empty');
    }
    else
        throw new Error('parameters cannot be empty');
}
else {
    if (Object.entries(data).length !== 0) {
        let sqlQuery: string = \`\${this.table}(\`;
        for (const key in data) {
            sqlQuery += \`\\\`\${key}\\\`,\`;
        }
        sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
        sqlQuery += ') VALUES(';
        for (const key in data) {
            sqlQuery += \`'\${data[key]}',\`;
        }
        sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
        sqlQuery += ')';
        return \`INSERT INTO \${sqlQuery}\`;
    } else
        throw new Error('parameters cannot be empty');
}`);
                        }
                    },
                    {
                        name: 'fillSqlQueryToUpdate',
                        scope: 'protected',
                        parameters: [
                            {
                                name: 'data',
                                type: 'any'
                            },
                            {
                                name: 'where',
                                type: 'any'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`const value: any = data;
const valueWhere: any = where;
let sqlQuery: string = '';
if (Object.entries(value).length !== 0 && Object.entries(valueWhere).length !== 0) {
    for (const key in value) {
        sqlQuery += \`\${this.table}.\${key}='\${value[key]}',\`;
    }
    sqlQuery = \`UPDATE \${this.table} SET \${sqlQuery.slice(0, sqlQuery.length - 1)} WHERE \`;
    for (const key in valueWhere) {
        sqlQuery += \`\${this.table}.\${key}='\${valueWhere[key]}' AND \`;
    }
    sqlQuery = sqlQuery.slice(0, sqlQuery.length - 5);
    return sqlQuery;
}
throw new Error("parameters cannot be empty");`);
                        }
                    },
                    {
                        name: 'fillSqlQueryToDelete',
                        scope: 'protected',
                        parameters: [
                            {
                                name: 'where',
                                type: 'any'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`let sqlQuery: string = \`DELETE FROM \${this.table}\`;
sqlQuery += this.fillSqlQueryToWhere(where);
return sqlQuery;`);
                        }
                    },
                    {
                        name: 'fillSqlQueryToWhere',
                        scope: 'private',
                        parameters: [
                            {
                                name: 'valueWhere',
                                type: 'any'
                            }
                        ],
                        onWriteFunctionBody: writer => {
                            writer.writeLine(`let sqlQuery: string = ' WHERE ';
if (valueWhere !== undefined) {
    if (Object.entries(valueWhere).length !== 0) {
        for (const key in valueWhere) {
            sqlQuery += \`\${this.table}.\${key}='\${valueWhere[key]}' AND \`;
        }
        sqlQuery = sqlQuery.slice(0, sqlQuery.length - 5);
        return sqlQuery;
    }
}
return '';`);
                        }
                    },
                ]
            }
        ]

    });
    if (!fs.existsSync(pathModelCore))
        fs.mkdirSync(pathModelCore, { recursive: true });
    fs.writeFileSync(pathModelCore + '/' + file.fileName, file.write());
};