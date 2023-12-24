import { NextFunction, Request, Response } from "express";
import { Controller } from "../core/controllers/controller";
import ErrorRest from "../core/libs/error-rest";

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const controller = new Controller();
        if (!req.headers.authorization) throw new ErrorRest({ message: 'Solicitud no autorizada', detail: 'Authorization header is required', status: 700 }, 401)

        let token = req.headers.authorization.split(' ')[1];
        if (token === null || token == '') throw new ErrorRest({ message: 'No se pudo procesar la autorización por falta de datos', detail: 'Token cannot be null', status: 700 }, 401);

        //? Specifies the interface of the token
        const payload: any = controller.verifyToken(token);
        if (!payload) throw new ErrorRest({ message: 'No se pudo procesar la autorización por un fallo interno', detail: 'Return value is empty', status: 802 }, 401);

        //? Additional validation with your database

        req.app.set('payload', payload);
        return next();
    } catch (error) {
        next(error);
    }
}