"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Security = exports.cryptr = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cryptr_1 = __importDefault(require("cryptr"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const controller_1 = require("../controllers/controller");
exports.cryptr = new cryptr_1.default(String(process.env.KEY));
class Security {
    cryptr = exports.cryptr;
    async generateHash(password) {
        try {
            const salt = await bcryptjs_1.default.genSalt(10);
            return await bcryptjs_1.default.hash(password, salt);
        }
        catch (error) {
            throw new Error(String(error));
        }
    }
    async validateHash(password, passwordEncrypt) {
        try {
            return await bcryptjs_1.default.compare(password, passwordEncrypt);
        }
        catch (error) {
            throw new Error(String(error));
        }
    }
    createToken(data) {
        return jsonwebtoken_1.default.sign(data, process.env.KEY || 'SecretKey1234');
    }
    decryptToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    verifyToken = async (req, res, next) => {
        const controller = new controller_1.Controller();
        try {
            if (!req.headers.authorization)
                return res.status(401).json(controller.setResponse({ text: 'Solicitud no autorizada', errors: 'Authorization header is required', status: 700 }));
            let token = req.headers.authorization.split(' ')[1];
            if (token === null)
                return res.status(401).json(controller.setResponse({ text: 'No se pudo procesar la autorización por falta de datos', errors: 'Token cannot be null', status: 700 }));
            const payload = jsonwebtoken_1.default.verify(token, process.env.KEY || 'SecretKey1234');
            if (!payload)
                return res.status(401).json(controller.setResponse({ text: 'No se pudo procesar la autorización por un fallo interno', errors: 'Return value is empty', status: 802 }));
            req.app.set('payload', payload);
            return next();
        }
        catch (error) {
            return res.status(500).json(controller.setResponse({ text: 'Ha ocurrido un error inesperado', status: 801, errors: error.message }));
        }
    };
}
exports.Security = Security;
