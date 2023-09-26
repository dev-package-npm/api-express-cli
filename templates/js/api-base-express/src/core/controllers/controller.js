import { Security } from "../libs/security.js";

export class Controller extends Security {

    //#region Propiedades
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
    //#endregion

    /**
     * 
     * @param options 
     * @param codeHttp 
     * @returns 
     * @example 
     *  setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }) // Error response
     *  setResponse({ text: 'Recurso creado' }, 201)
     *  setResponse({ text: 'Listado de usuarios', [{name:""}] })
     */
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
        let dataReturn= { response: this.response };
        if (codeHttp != undefined) {
            this.code = codeHttp;
            Object.assign(dataReturn, { code: codeHttp });
        }
        return dataReturn;
    }

    /**
     * 
     * Este método valida por cantidad de parámetros y valida que los valores no sean nulos o indefinidos.
     * @param req Parameter object sent via http
     * @param options 
     * @returns true or reply message
     * @example
     * ValidateParams(req.query, {requiredParameters:{param1, param2}})
     * ValidateParams(req.body, {requiredParameters:{param1, param2}, nullParameters:{param3, param4}})
     * ValidateParams(req.query, {requiredParameters:{param1, param2}, nullParameters:{param3}, skipQuantityValidation:true})
     */
     async validateParams(req, options ) {
        options.nullParameters = options.nullParameters !== undefined && Object.entries(options.nullParameters).length != 0 ? options.nullParameters : {};
        options.requiredParameters = options.requiredParameters !== undefined && Object.entries(options.requiredParameters).length != 0 ? options.requiredParameters : {};
        let control = 0;
        let validParams= Object.keys(options.requiredParameters || {});
        let paramsNull = typeof options.nullParameters == 'object' ? Object.keys(options.nullParameters) : [];
        let response = {};

        // Verifica si el valor es nulo y requerido, cosa que no es permitida por el método 
        for (let i = 0; i < paramsNull.length; i++) {
            const equals = await this.#validateEquals(validParams, paramsNull[i]);
            if (equals != -1) {
                return `the <${paramsNull[i]}> parameter cannot be mandatory and null at the same time`;
            };
        }

        if (Object.keys(req).length > 0) {
            var request = Object.keys(req);
            // Se asignan los parámetros que son nulos al array de parámetros válidos
            Array.prototype.push.apply(validParams, paramsNull);

            if (paramsNull.length > 0) {
                for (const item of paramsNull) {
                    if (request.indexOf(item) == -1) request.push(item);
                }
            }

            //#region Obtiene los parámetros que no son admitidos, o están mandando adicionalmente
            let unsupported_parameters = await this.#getInvalidParameters(request, validParams);
            if (unsupported_parameters.length > 0) {

                response = {
                    message: `the number of parameters are not valid: expected <${Object.keys(options.requiredParameters).length + paramsNull.length}>`,
                    expected: validParams,
                    unsupported_parameters
                };

                paramsNull.length > 0 ? Object.assign(response, { optional: paramsNull }) : '';
                let missingParameters = await this.#getMissingParameters(req, options.requiredParameters);
                missingParameters.length > 0 ? Object.assign(response, { missing_parameters: missingParameters }) : '';

                return response;
            }

            //#endregion

            //#region Valida que los valores requeridos los estén enviando.
            if (request.length != validParams.length) {
                const arrayParamInvalid = await this.#getInvalidParameters(request, validParams);
                const invalidParams= `invalidParams = <${arrayParamInvalid}>`;
                let missingParameters = await this.#getMissingParameters(req, options.requiredParameters);
                response = {
                    message: `the number of parameters are not valid: expected <${Object.keys(options.requiredParameters).length + paramsNull.length}>`,
                    expected: validParams
                }
                paramsNull.length > 0 ? Object.assign(response, { optional: paramsNull }) : '';
                arrayParamInvalid.length > 0 ? Object.assign(response, { invalid_params: invalidParams }) : '';
                missingParameters.length > 0 ? Object.assign(response, { missing_parameters: missingParameters }) : '';
                return response;
            }
            //#endregion

            await this.#asignValueToNull(req, paramsNull);
            for (let index1 = 0; index1 < validParams.length; index1++) {
                // Se asegura de que los parámetros envíados sean igual a los esperados
                var validation = await this.#validateEquals(request, validParams[index1]);
                control = 0;
                if (validation != -1) {
                    control = 1;
                    // Se valida que los valores no sean nulos o indefinidos
                    if (req[request[validation]] == '' || req[request[validation]] == null || req[request[validation]] == undefined) {
                        response = `the <${request[validation]}> parameter cannot be null or undefined`;
                        return response;
                    }
                }
                else if (control == 0 && validation == -1) {
                    const arrayParamInvalid = await this.#getInvalidParameters(request, validParams);
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
                message: `the number of parameters are not valid > length of received parameters = 0: expected <${Object.keys(options.requiredParameters).length || 0 + paramsNull.length}>`,
                expected: validParams
            }
            paramsNull.length > 0 ? Object.assign(response, { optional: paramsNull }) : '';
            // response = `the number of parameters are not valid > length of received parameters = 0: expected <${Object.keys(options.requiredParameters).length + paramsNull.length}>  <${validParams}>`;
            return response;
        }

    }

    //#region Métodos privados

    //#region Validación de parámetros
    /**
     * 
     * @param request 
     * @param value 
     * @returns index when equal or -1 when not
     */
    async #validateEquals(request, value) {
        for (let index2 = 0; index2 < request.length; index2++) {
            if (request[index2] == value) {
                return index2;
            }
        }
        return -1;
    }

    /**
     * 
     * @param req 
     * @param paramsValid 
     * @returns array of invalid parameters
     */
    async #getInvalidParameters(req, paramsValid) {
        let invalidParams = [];
        for (let index = 0; index < req.length; index++) {
            const result = await this.#validateEquals(paramsValid, req[index]);
            if (result == -1) {
                invalidParams.push(req[index]);
            }
        }
        return invalidParams;
    }

    async #getMissingParameters(req, requiredParameters) {
        let missingParameters = [];
        for (const item of Object.keys(requiredParameters)) {
            if (!Object.hasOwn(req, item)) missingParameters.push(item);
        }
        return missingParameters;
    }

    /**
     * 
     * @param request 
     * @param array 
     */
    async #asignValueToNull(request, array) {
        for (let i = 0; i < array.length; i++) {
            if (request[array[i]] != undefined || request[array[i]] == null) { request[array[i]] = ' ' };
        }
    }

    //#endregion


    //#endregion
}