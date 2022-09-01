//#region Imports
import { Request, Response } from "express";
// Local
import { validateParams } from "../core/helpers/request-http-params.helper";
import { setResponse } from "../core/helpers/response-http.helper";
// Models
//#endregion

//#region Models
//#endregion

class PruebaController {
    private static response = setResponse({});
    private static code = 200;

    async create(req: Request, res: Response) {
        const { } = req.body;
        try {
            //#region Validate params
            const validation = await validateParams(req.body, {});
            if (validation != true)
                return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));
            //#region Validate params

            return res.status(PruebaController.code).json(PruebaController.response);
        }
        catch (error: any) {
            return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));
        }
    }

    async get(req: Request, res: Response) {
        const { } = req.query;
        try {
            //#region Validate params
            const validation = await validateParams(req.query, {});
            if (validation != true)
                return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));
            //#region Validate params

            return res.status(PruebaController.code).json(PruebaController.response);
        }
        catch (error: any) {
            return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));
        }
    }

    async update(req: Request, res: Response) {
        const { } = req.body;
        try {
            //#region Validate params
            const validation = await validateParams(req.body, {});
            if (validation != true)
                return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));
            //#region Validate params

            return res.status(PruebaController.code).json(PruebaController.response);
        }
        catch (error: any) {
            return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));
        }
    }

    async delete(req: Request, res: Response) {
        const { } = req.query;
        try {
            //#region Validate params
            const validation = await validateParams(req.query, {});
            if (validation != true)
                return res.status(400).json(setResponse({ text: 'Los parámetros son inválidos', errors: validation, status: 700 }));
            //#region Validate params

            return res.status(PruebaController.code).json(PruebaController.response);
        }
        catch (error: any) {
            return res.status(500).json(setResponse({ text: 'Ha ocurrido un error inesperado', errors: error.message, status: 801 }));
        }
    }
}

export default PruebaController;
