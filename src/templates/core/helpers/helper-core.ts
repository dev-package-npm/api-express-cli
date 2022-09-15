import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { dir } from '../../../config/structure-configuration.json';

const pathHelperCore = path.resolve() + '/' + dir + '/core/helpers/';

export const createRequestHttpParams = () => {
    const file = createFile({
        fileName: 'request-http-params.helper.ts',
        interfaces: [
            {
                name: 'IRequest',
                properties: [
                    {
                        name: 'requiredParameters',
                        isOptional: true,
                        type: 'Object | any',
                    },
                    {
                        name: 'nullParameters',
                        isOptional: true,
                        type: 'Object | any'
                    },
                    {
                        name: 'skipQuantityValidation',
                        isOptional: true,
                        type: 'boolean'
                    }
                ],
                onBeforeWrite: writer => writer.writeLine('//#region Interface'),
                onAfterWrite: writer => writer.writeLine('//#endregion'),
            }
        ],
        functions: [
            {
                documentationComment: `/**
 * 
 * This method validates by number of parameters and validates that the values ​​are not null or undefined.
 * @param req Parameter object sent via http
 * @param options 
 * @returns true or reply message
 * @example
 * ValidateParams(req.query, { requiredParameters:{ param1, param2 }});
 * ValidateParams(req.body, { requiredParameters:{ param1, param2 }, nullParameters:{ param3, param4 }}):
 * ValidateParams(req.query, { requiredParameters:{ param1, param2 }, nullParameters:{ param3 }, skipQuantityValidation:true});
 */`,
                isExported: true,
                isAsync: true,
                name: 'validateParams',
                parameters: [
                    {
                        name: 'req',
                        type: 'object | any'
                    },
                    {
                        name: 'options',
                        type: 'IRequest'
                    }
                ],
                returnType: 'Promise<any>',
                onWriteFunctionBody: writer => {
                    writer.writeLine(`let control: number = 0;
let validParams: Array<any> = Object.keys(options.requiredParameters || {});
let paramsNull: Array<any> = typeof options.nullParameters == 'object' ? Object.keys(options.nullParameters) : [];
let response = {};
const nullParameters: string = \`with null parameters = <\${paramsNull} > \`;

// Verifica si el valor es nulo y requerido, cosa que no es permitida por el método 
for (let i = 0; i < paramsNull.length; i++) {
    const equals = await validateEquals(validParams, paramsNull[i]);
    if (equals != -1) {
        return \`the < \${paramsNull[i]}> parameter cannot be mandatory and null at the same time\`;
    };
}

if (Object.keys(req).length > 0) {
    var request: any = Object.keys(req);
    // Se asignan los parámetros que son nulos al array de parámetros válidos
    Array.prototype.push.apply(validParams, paramsNull);
    if (request.length == validParams.length || options.skipQuantityValidation == true) {
        await asignValueToNull(req, paramsNull);
        for (let index1 = 0; index1 < validParams.length; index1++) {
            // Se asegura de que los parámetros envíados sean igual a los esperados
            var validation = await validateEquals(request, validParams[index1]);
            control = 0;
            if (validation != -1) {
                control = 1;
                // Se valida que los valores no sean nulos o indefinidos
                if (req[request[validation]] == \'\' || req[request[validation]] == null || req[request[validation]] == undefined) {
                    response = \`the < \${request[validation]}> parameter cannot be null or undefined\`;
                    return response;
                }
            }
            else if (control == 0 && validation == -1) {
                const arrayParamInvalid = await getInvalidParameters(request, validParams);
                response = \`invalid parameters near < \${arrayParamInvalid[0]}>: expected < \${validParams[index1]}> \`;
                return response;
            }
        }
    }
    else {
        const arrayParamInvalid = await getInvalidParameters(request, validParams);
        const invalidParams: string = \`invalidParams = <\${arrayParamInvalid} > \`;
        response = \`the number of parameters are not valid: expected < \${Object.keys(options.requiredParameters).length + paramsNull.length}> <\${validParams} > \${paramsNull.length > 0 ? nullParameters : \'\'} \${arrayParamInvalid.length > 0 ? invalidParams : \'\'} \`;
        return response;
    }
    return true;
}
else if (Object.keys(req).length === validParams.length) {
    return true;
}
else {
    response = \`the number of parameters are not valid > length of received parameters = 0: expected < \${Object.keys(options.requiredParameters).length + paramsNull.length}> <\${validParams} >\`;
    return response;
}`);
                }
            },
            {
                documentationComment: `/**
 * 
 * @param request 
 * @param value 
 * @returns index when equal or -1 when not
 */`,
                isAsync: true,
                name: 'validateEquals',
                parameters: [
                    {
                        name: 'request',
                        type: 'Array<any>'
                    },
                    {
                        name: 'value',
                        type: 'string'
                    }
                ],
                returnType: 'Promisse<any>',
                onWriteFunctionBody: writer => {
                    writer.writeLine(`for (let index2 = 0; index2 < request.length; index2++) {
    if (request[index2] == value) {
        return index2;
    }
}
return -1;`);
                }
            },
            {
                documentationComment: `/**
 * 
 * @param req 
 * @param paramsValid 
 * @returns array of invalid parameters
 */`,
                isAsync: true,
                name: 'getInvalidParameters',
                parameters: [
                    {
                        name: 'req',
                        type: 'Array<any>'
                    },
                    {
                        name: 'paramsValid',
                        type: 'Array<any>'
                    }
                ],
                returnType: 'Promise<Array<any>>',
                onWriteFunctionBody: writer => {
                    writer.writeLine(`let invalidParams: any[] = [];
for (let index = 0; index < req.length; index++) {
    const result = await validateEquals(paramsValid, req[index]);
    if (result == -1) {
        invalidParams.push(req[index]);
    }
}
return invalidParams;`);
                }
            },
            {
                documentationComment: `/**
 * 
 * @param request 
 * @param array 
 */`,
                isAsync: true,
                name: 'asignValueToNull',
                parameters: [
                    {
                        name: 'request',
                        type: 'object | any'
                    },
                    {
                        name: 'array',
                        type: 'Array<any>'
                    }
                ],
                returnType: 'Promise<void>',
                onWriteFunctionBody: writer => {
                    writer.writeLine(`for (let i = 0; i < array.length; i++) {
    if (request[array[i]] != undefined || request[array[i]] == null) { request[array[i]] = ' ' };
}`);
                }
            }
        ]
    });

    if (!fs.existsSync(pathHelperCore))
        fs.mkdirSync(pathHelperCore, { recursive: true });
    fs.writeFileSync(pathHelperCore + '/' + file.fileName, file.write());
};

export const createResponseHttp = () => {
    const file = createFile({
        fileName: 'response-http.helper.ts',
        interfaces: [
            {
                name: 'IResponse',
                properties: [
                    {
                        name: 'status',
                        type: 'number'
                    },
                    {
                        name: 'error',
                        type: 'boolean'
                    },
                    {
                        name: 'message',
                        type: `{
    text: string;
    errors: Array<any> | string
}`
                    },
                    {
                        name: 'data',
                        type: 'Array<any> | string | object | unknown'
                    }
                ]
            },
            {
                name: 'IParamsResponse',
                properties: [
                    {
                        name: 'text',
                        isOptional: true,
                        type: 'string'
                    },
                    {
                        name: 'data',
                        isOptional: true,
                        type: 'Array<any> | object | string | unknown'
                    },
                    {
                        name: 'errors',
                        isOptional: true,
                        type: 'Array<any> | string'
                    },
                    {
                        name: 'status',
                        isOptional: true,
                        type: 'number'
                    }
                ]
            }
        ],
        functions: [
            {
                isExported: true,
                name: 'seResponse',
                returnType: 'IResponse',
                parameters: [
                    {
                        name: 'options',
                        type: 'IParamsResponse'
                    }
                ],
                onWriteFunctionBody: writer => {
                    writer.writeLine(`const response: IResponse = {
    status: options.status || 200,
    error: options.errors != undefined ? true : false,
    message: {
        text: options.text || '',
        errors: options.errors || []
    },
    data: options.data || []
};
return response;`);
                }
            }
        ]
    });

    if (!fs.existsSync(pathHelperCore))
        fs.mkdirSync(pathHelperCore, { recursive: true });
    fs.writeFileSync(pathHelperCore + '/' + file.fileName, file.write());
};