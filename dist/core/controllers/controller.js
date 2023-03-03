"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const security_1 = require("../libs/security");
class Controller extends security_1.Security {
    response = {
        status: 200,
        error: false,
        message: {
            text: '',
            errors: []
        },
        data: []
    };
    code = 200;
    setResponse(options, codeHttp) {
        this.response = {
            status: options.status || 200,
            error: options.errors != undefined ? true : false,
            message: {
                text: options.text || '',
                errors: options.errors || []
            },
            data: options.data || []
        };
        let dataReturn = { response: this.response };
        if (codeHttp != undefined) {
            this.code = codeHttp;
            Object.assign(dataReturn, { code: codeHttp });
        }
        return dataReturn;
    }
    async validateParams(req, options) {
        let control = 0;
        let validParams = Object.keys(options.requiredParameters || {});
        let paramsNull = typeof options.nullParameters == 'object' ? Object.keys(options.nullParameters) : [];
        let response = {};
        for (let i = 0; i < paramsNull.length; i++) {
            const equals = await this.validateEquals(validParams, paramsNull[i]);
            if (equals != -1) {
                return `the <${paramsNull[i]}> parameter cannot be mandatory and null at the same time`;
            }
            ;
        }
        if (Object.keys(req).length > 0) {
            var request = Object.keys(req);
            Array.prototype.push.apply(validParams, paramsNull);
            if (paramsNull.length > 0) {
                for (const item of paramsNull) {
                    if (request.indexOf(item) == -1)
                        request.push(item);
                }
            }
            let unsupported_parameters = await this.getInvalidParameters(request, validParams);
            if (unsupported_parameters.length > 0) {
                response = {
                    message: `the number of parameters are not valid: expected <${Object.keys(options.requiredParameters).length + paramsNull.length}>`,
                    expected: validParams,
                    unsupported_parameters
                };
                paramsNull.length > 0 ? Object.assign(response, { optional: paramsNull }) : '';
                let missingParameters = await this.getMissingParameters(req, options.requiredParameters);
                missingParameters.length > 0 ? Object.assign(response, { missing_parameters: missingParameters }) : '';
                return response;
            }
            if (request.length != validParams.length) {
                const arrayParamInvalid = await this.getInvalidParameters(request, validParams);
                const invalidParams = `invalidParams = <${arrayParamInvalid}>`;
                let missingParameters = await this.getMissingParameters(req, options.requiredParameters);
                response = {
                    message: `the number of parameters are not valid: expected <${Object.keys(options.requiredParameters).length + paramsNull.length}>`,
                    expected: validParams
                };
                paramsNull.length > 0 ? Object.assign(response, { optional: paramsNull }) : '';
                arrayParamInvalid.length > 0 ? Object.assign(response, { invalid_params: invalidParams }) : '';
                missingParameters.length > 0 ? Object.assign(response, { missing_parameters: missingParameters }) : '';
                return response;
            }
            await this.asignValueToNull(req, paramsNull);
            for (let index1 = 0; index1 < validParams.length; index1++) {
                var validation = await this.validateEquals(request, validParams[index1]);
                control = 0;
                if (validation != -1) {
                    control = 1;
                    if (req[request[validation]] == '' || req[request[validation]] == null || req[request[validation]] == undefined) {
                        response = `the <${request[validation]}> parameter cannot be null or undefined`;
                        return response;
                    }
                }
                else if (control == 0 && validation == -1) {
                    const arrayParamInvalid = await this.getInvalidParameters(request, validParams);
                    response = `invalid parameters near <${arrayParamInvalid[0]}>: expected <${validParams[index1]}>`;
                    return response;
                }
            }
            return true;
        }
        else if (Object.keys(req).length === validParams.length) {
            return true;
        }
        else {
            response = {
                message: `the number of parameters are not valid > length of received parameters = 0: expected <${Object.keys(options.requiredParameters).length + paramsNull.length}>`,
                expected: validParams
            };
            paramsNull.length > 0 ? Object.assign(response, { optional: paramsNull }) : '';
            return response;
        }
    }
    async validateEquals(request, value) {
        for (let index2 = 0; index2 < request.length; index2++) {
            if (request[index2] == value) {
                return index2;
            }
        }
        return -1;
    }
    async getInvalidParameters(req, paramsValid) {
        let invalidParams = [];
        for (let index = 0; index < req.length; index++) {
            const result = await this.validateEquals(paramsValid, req[index]);
            if (result == -1) {
                invalidParams.push(req[index]);
            }
        }
        return invalidParams;
    }
    async getMissingParameters(req, requiredParameters) {
        let missingParameters = [];
        for (const item of Object.keys(requiredParameters)) {
            if (!Object.hasOwn(req, item))
                missingParameters.push(item);
        }
        return missingParameters;
    }
    async asignValueToNull(request, array) {
        for (let i = 0; i < array.length; i++) {
            if (request[array[i]] != undefined || request[array[i]] == null) {
                request[array[i]] = ' ';
            }
            ;
        }
    }
}
exports.Controller = Controller;
