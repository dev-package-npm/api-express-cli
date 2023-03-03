"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = __importDefault(require("./middlewares/middlewares"));
const routes_1 = __importDefault(require("../../routes/routes"));
class Server {
    app;
    pathDefault = '/api/abrev/v1/';
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    async config() {
        await (0, middlewares_1.default)(this.app);
    }
    routes() {
        this.app.get('/', (req, res) => res.status(200).send('index API'));
        this.app.use(this.pathDefault, routes_1.default);
    }
    start() {
        if (process.env.NODE_ENV === 'production')
            this.app.listen(this.app.get('port'));
        else
            this.app.listen(this.app.get('port'), () => console.log('Server initialized and listening on the port:', this.app.get('port'), ` visit: http://${process.env[`HOSTNAME_APP_${String(process.env.NODE_ENV).toUpperCase()}`]}`));
    }
}
exports.default = Server;
