/// <reference types="node" />
import Cryptr from 'cryptr';
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
export declare const cryptr: Cryptr;
export declare abstract class Security {
    cryptr: Cryptr;
    generateHash(password: string): Promise<string>;
    validateHash(password: any, passwordEncrypt: string): Promise<boolean>;
    createToken(data: string | object | Buffer): string;
    decryptToken(token: any): string | jwt.JwtPayload | null;
    verifyToken: (req: Request, res: Response, next: NextFunction) => Promise<any>;
}
