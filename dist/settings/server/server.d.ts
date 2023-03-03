import { Application } from "express";
declare class Server {
    app: Application;
    private pathDefault;
    constructor();
    private config;
    private routes;
    start(): void;
}
export default Server;
