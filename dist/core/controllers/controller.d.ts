import { Security } from "../libs/security";
export interface IResponse {
    status: number;
    error: boolean;
    message: {
        text: string;
        errors: any;
    };
    data: Array<any> | string | Object | unknown;
}
type IParamsResponse = {
    text?: string;
    data?: Array<any> | Object | string | unknown;
    errors?: Array<any> | string;
    status?: number;
};
type TCodeHttp = 100 | 101 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 300 | 301 | 302 | 303 | 304 | 305 | 307 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 426 | 500 | 501 | 502 | 503 | 504 | 505;
interface Irequest {
    requiredParameters?: Object | any;
    nullParameters?: Object | any;
}
export declare class Controller extends Security {
    protected response: IResponse;
    protected code: TCodeHttp;
    setResponse(options: IParamsResponse, codeHttp?: TCodeHttp): {
        response: IResponse;
        code?: TCodeHttp;
    };
    protected validateParams(req: object | any, options: Irequest): Promise<any>;
    private validateEquals;
    private getInvalidParameters;
    private getMissingParameters;
    private asignValueToNull;
}
export {};
