import bcrypt from "bcryptjs";
import Cryptr from 'cryptr';
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { Controller } from "../controllers/controller.js";


export const cryptr = new Cryptr(String(process.env.KEY));

export class Security {
    cryptr = cryptr;
    
    constructor() {
        if (this.constructor === Parent)
            throw new Error("Can't, instantiate abstract class!");
        this.type = 'parent';
    }

    /**
     * Genrate hash for passwordss
     * @param password 
     * @param rounds default 10
     * @returns 
     */
    async generateHash(password, rounds = 10){
        try {
            const salt = await bcrypt.genSalt(rounds);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            throw new Error(String(error));
        }
    }

    /**
     * Validate the password is correct
     * @param password Format string
     * @param passwordEncrypted 
     * @returns 
     */
    async validateHash(password, passwordEncrypted) {
        try {
            return await bcrypt.compare(password, passwordEncrypted);
        } catch (error) {
            throw new Error(String(error));
        }
    }

    createToken(data) {
        return jwt.sign(data, process.env.KEY || 'SecretKey1234');
    }

    decryptToken(token) {
        return jwt.decode(token);
    }

    verifyToken = async (req, res, next) => {
        const controller = new Controller();
        try {
            if (!req.headers.authorization)
                return res.status(401).json(controller.setResponse({ text: 'Solicitud no autorizada', errors: 'Authorization header is required', status: 700 }));
            let token = req.headers.authorization.split(' ')[1];
            if (token === null)
                return res.status(401).json(controller.setResponse({ text: 'No se pudo procesar la autorización por falta de datos', errors: 'Token cannot be null', status: 700 }));
            //? Specifies the interface of the token
            const payload= jwt.verify(token, process.env.KEY || 'SecretKey1234');
            if (!payload)
                return res.status(401).json(controller.setResponse({ text: 'No se pudo procesar la autorización por un fallo interno', errors: 'Return value is empty', status: 802 }));
            req.app.set('payload', payload);
            return next();
        } catch (error) {
            return res.status(500).json(controller.setResponse({ text: 'Ha ocurrido un error inesperado', status: 801, errors: error.message }));
        }
    }

}