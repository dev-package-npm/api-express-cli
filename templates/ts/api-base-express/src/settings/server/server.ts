//#region imports npm modules
import express, { Application, Request, Response } from "express";
// Local import

// routes controller, middlewares
import middlewares from "./middlewares/middleware";
import router from "../../routes/routes";
import { errorHandler } from "../../helpers/error-handler";
//#endregion

class Server {
    app: Application;
    private pathDefault = '/api/abrev/v1/';

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    private async config() {
        await middlewares(this.app);
    }

    private routes() {
        // Show API index
        this.app.get('/', (req: Request, res: Response) => res.status(200).send('index API'));
        // Main routes
        this.app.use(this.pathDefault, router);
        this.app.use(errorHandler);
    }

    start() {
        if (process.env.NODE_ENV === 'production') this.app.listen(this.app.get('port'));
        else
            this.app.listen(this.app.get('port'), () => console.log('Server initialized and listening on the port:', this.app.get('port'), ` visit: http://${process.env[`HOSTNAME_APP_${String(process.env.NODE_ENV).toUpperCase()}`]}`));
    }
}

export default Server;
