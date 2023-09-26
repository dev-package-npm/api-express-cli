import express from "express";
import morgan from "morgan";
import dotenvExpand from "dotenv-expand";
import path from "path";
import dotenv from "dotenv";

const config = dotenv.config({ path: path.resolve() + '/.env' });
dotenvExpand.expand(config);

const middlewares = async (app)=> {
    app.set('port', process.env.PORT || 0);
    app.use(express.json());
    app.use(morgan('dev'));
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', ' *');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.header('Allow', 'GET, POST, PUT, DELETE');
        next();
    });
};

export default middlewares;
