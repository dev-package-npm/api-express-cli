import { Application } from "express";
declare const middlewares: (app: Application) => Promise<void>;
export default middlewares;
