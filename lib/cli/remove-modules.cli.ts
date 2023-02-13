import inquirer from 'inquirer';
import { exec } from 'child_process';
import ansiColors from 'ansi-colors';
import fs, { promises } from 'fs';
import { pathModelCore } from '../templates/core/models/model-core';
import { isExistModuleDatabase, pathDatabase } from '../templates/settings/database';
import { pathModel } from '../templates/model';
import { isExistModuleWs, removeServerWs } from '../templates/websocket/server-ws';
import { removeControllerWs } from '../templates/websocket/controller-ws';
import { removeRouteWs } from '../templates/websocket/route-ws';
import { removeLineEnv } from '../templates/env';
import { config1 } from '../config/structure-configuration.json';

export const removeModules = async (params: Array<string>) => {
    // console.log(arrayParams.length);
    let choices = [];

    if (isExistModuleDatabase())
        choices.push({ name: 'Database(MySql)', value: 'db:mysql' });
    if (isExistModuleWs())
        choices.push({ name: 'WS (SocketIo)', value: 'ws' });

    if (choices.length > 0) {
        if (params != undefined && params.length != 0) {
            interpretAnswer(params[0]);
        } else
            await inquirer.prompt({
                type: 'list',
                name: 'utilities',
                message: 'Select the module to remove: ',
                choices
            }).then((answer) => {
                interpretAnswer(answer.utilities);
            });
    } else console.log(ansiColors.blueBright('No modules to remove'));
}

const interpretAnswer = async (answer: string) => {
    switch (answer) {
        case 'db:mysql':
            if (fs.existsSync(pathModel) && fs.readdirSync(pathModel).length == 0) {
                if (fs.existsSync(pathDatabase + 'database.ts') && fs.existsSync(pathModelCore + config1.subDir.core.models[0])) {
                    console.log("Uninstall  packages...");
                    exec('npm r promise-mysql', async (error, stdout, stderr) => {
                        console.log(ansiColors.blueBright('✓ Done'));
                        if (!error && stdout != '' && !stderr) {
                            if (fs.existsSync(pathDatabase + 'database.ts')) await promises.unlink(pathDatabase + 'database.ts');

                            if (fs.existsSync(pathModelCore + config1.subDir.core.models[0])) {
                                await promises.unlink(pathModelCore + config1.subDir.core.models[0])
                                if (fs.readdirSync(pathModelCore).length == 0)
                                    fs.rmdirSync(pathModelCore);
                                await removeLineEnv();
                            };
                        } else
                            console.log(error || stderr);
                    });
                }
                else console.log(ansiColors.yellowBright(`The '${answer}' module is not added`));
            } else if (!fs.existsSync(pathModel) && !fs.existsSync(pathDatabase + 'database.ts')) console.log(ansiColors.yellowBright(`The '${answer}' module is not added`));
            else console.log(ansiColors.redBright(`Could not delete module, because there are model files.${ansiColors.blueBright(' (Delete manually)')}`));
            break;
        case 'ws':
            console.log("Uninstall  packages...");
            exec('npm r socket.io', async (error, stdout, stderr) => {
                console.log(ansiColors.blueBright('✓ Done'));
                if (!error && stdout != '' && !stderr) {
                    await removeServerWs();
                    removeControllerWs();
                    await removeRouteWs();
                } else
                    console.log(error || stderr);
            });

            break;
        default:
            console.log(ansiColors.redBright('Invalid attribute'));
            // exit(1);
            break;
    }
}