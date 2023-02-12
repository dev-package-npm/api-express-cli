import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
// Local
import { config1 } from '../config/structure-configuration.json';
import { createServerHttp } from "../templates/settings/server";
import { createMiddlewares } from "../templates/settings/middlewares";
import { routeIndex } from "../templates/route-index";
import { createIndexApi } from '../templates/index-api';
import { createEnvFile } from '../templates/env';
import ansiColors from 'ansi-colors';
import { createControllerCore } from '../templates/core/controllers/controller-core';
import { createSecurityCore } from '../templates/core/libs/security';
import { addLineFilePackage } from '../templates/package';

export const startStructure = () => {
    return new Promise((resolve, reject) => {
        const pathWork = path.resolve() + '/' + config1.dir;

        if (!fs.existsSync(pathWork)) {
            const devPackages = '@types/morgan @types/express @types/node @types/bcryptjs @types/cryptr @types/jsonwebtoken nodemon typescript';
            const _package = 'express morgan dotenv dotenv-expand bcryptjs cryptr jsonwebtoken';
            console.log('Installing packages...');
            exec('npm i ' + _package, (error, stdout, stderr) => {
                if (!error && stdout != '' && !stderr) {
                    exec('npm i -D ' + devPackages, (error, stdout, stderr) => {
                        console.log(ansiColors.blueBright('✓ Done'));
                        if (!error && stdout != '' && !stderr) {
                            const folders = Object.keys(config1.subDir).filter(value => value != 'models' && value != 'databases');
                            const foldersSecundary = ['routes', 'controllers', 'models', 'helpers'];
                            folders.forEach((value) => {
                                fs.mkdirSync(pathWork + '/' + value, { recursive: true });
                            });
                            foldersSecundary.forEach((value) => {
                                // fs.mkdirSync(pathWork + '/services/auth/' + value, { recursive: true });
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
                            // Create core files
                            createControllerCore();
                            createSecurityCore();
                            // Create Server http
                            createMiddlewares();
                            createServerHttp();
                            createIndexApi();
                            if (!fs.existsSync(path.resolve() + '/tsconfig.json')) {
                                exec(`npx tsc --init --target ES2022 --removeComments true --outDir ./dist`, (error, stdout, tderr) => {
                                    if (!error && stdout != '' && !tderr) {
                                        addLineFilePackage();
                                        resolve(true);
                                    }
                                    else {
                                        console.log(error || stderr);
                                        reject(false);
                                    }
                                });

                            } else resolve(true);
                        } else {
                            console.log(error || stderr);
                            reject(false);
                        }
                    });
                } else {
                    console.log(error || stderr);
                    reject(false);
                }
            });

        }
        else {
            console.error(ansiColors.redBright('A project has already been initialized'));
            reject(false);
        }
    });
};