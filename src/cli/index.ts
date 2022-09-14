import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
// Local
import { dir } from '../config/structure-configuration.json';
import { createServerHttp } from "../templates/settings/server";
import { createMiddlewares } from "../templates/settings/middlewares";
import { routeIndex } from "../templates/route-index";
import { createIndexApi } from '../templates/index-api';
import { createRequestHttpParams, createResponseHttp } from '../templates/core/helpers/helper-core';
import { createEnvFile } from '../templates/env';
import ansiColors from 'ansi-colors';
import { createModelCore } from '../templates/core/models/model-core';
import { createDatabase } from '../templates/settings/database';

export const startStructure = (params?: string) => {

    const pathWork = path.resolve() + '/' + dir;
    // fs.rmSync(pathWork, { recursive: true, force: true });
    if (!fs.existsSync(pathWork) || true) {
        const types = '@types/morgan @types/express @types/node';
        // exec('npm i -D' + types, (error, stdout, stderr) => {
        //     if (!error && stdout != '' && !stderr) {
        const folders = ['core', 'helpers', 'services', 'controllers', 'routes', 'settings', 'testing', 'libs'];
        const foldersSecundary = ['routes', 'controllers', 'models', 'helpers'];
        // fs.mkdirSync(pathWork);
        folders.forEach((value) => {
            fs.mkdirSync(pathWork + '/' + value, { recursive: true });
        });
        foldersSecundary.forEach((value) => {
            fs.mkdirSync(pathWork + '/services/auth/' + value, { recursive: true });
            if (value != 'models' && value != 'helpers')
                fs.mkdirSync(pathWork + '/testing/' + value, { recursive: true });
        });
        fs.mkdirSync(pathWork + '/services/routes', { recursive: true });
        if (fs.existsSync(pathWork + '/routes/'))
            fs.writeFileSync(pathWork + '/routes/' + routeIndex(0).fileName, routeIndex(0).write());
        if (fs.existsSync(pathWork + '/testing/routes/')) {
            fs.writeFileSync(pathWork + '/testing/routes/' + routeIndex(1).fileName, routeIndex(1).write());
        }
        if (fs.existsSync(pathWork + '/services/routes/')) {
            fs.writeFileSync(pathWork + '/services/routes/' + routeIndex(2).fileName, routeIndex(2).write());
        }

        createEnvFile();
        // Create Server http
        createMiddlewares();
        createServerHttp();
        createIndexApi();
        // Create helpers files
        createRequestHttpParams();
        createResponseHttp();
        //     } else
        //         console.log(error || stderr);
        // });
    }
    else console.error(ansiColors.redBright('A project has already been initialized'));
};

export const startWsServer = () => {

};