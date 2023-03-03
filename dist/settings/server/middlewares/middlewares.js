"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const config = dotenv_1.default.config({ path: path_1.default.resolve() + '/.env' });
dotenv_expand_1.default.expand(config);
const middlewares = async (app) => {
    app.set('port', process.env.PORT || 0);
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', ' *');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.header('Allow', 'GET, POST, PUT, DELETE');
        next();
    });
};
exports.default = middlewares;
