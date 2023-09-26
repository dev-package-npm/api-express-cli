//#region imports npm modules
import express from "express";
// Local import

// routes controller, middlewares
import middlewares from "./middlewares/middleware.js";
import router from "../../routes/routes.js";
//#endregion

class Server {
    #app;
    #pathDefault = '/api/abrev/v1/';

    constructor() {
        this.#app = express();
        this.#config();
        this.#routes();
    }

    async #config() {
        await middlewares(this.#app);
    }

    #routes() {
        // Show API index
        this.#app.get('/', (req, res) => res.status(200).send('index API'));
        // Main routes
        this.#app.use(this.#pathDefault, router);
    }

    start() {
        if (process.env.NODE_ENV === 'production') this.#app.listen(this.#app.get('port'));
        else
            this.#app.listen(this.#app.get('port'), () => console.log('Server initialized and listening on the port:', this.#app.get('port'), ` visit: http://${process.env[`HOSTNAME_APP_${String(process.env.NODE_ENV).toUpperCase()}`]}`));
    }
}

export default Server;
