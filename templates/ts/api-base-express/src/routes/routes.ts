import { Router } from "express";

//#region routes
import testRouter from "../testing/routes/routes";
// Example
//import example1Router from "./example1.routes"
//#endregion

const router = Router();

//#region Definition of routes for the api
// Testing
router.use('/testing', testRouter);
// End points for entities
// Example
//router.use('/examples1', example1Router);
//#endregion

export default router;
