import inquirer from 'inquirer';
import { exec } from 'child_process';
import ansiColors from 'ansi-colors';
import { config1 } from '../config/structure-configuration.json';
import fs from 'fs';
import path from 'path';
import { createServerWs, isExistModuleWs } from '../templates/websocket/server-ws';
import { createControllerWs } from '../templates/websocket/controller-ws';
import { createRouteWs } from '../templates/websocket/route-ws';
import { exit } from 'process';
import { createModelCore } from '../templates/core/models/model-core';
import { createDatabase, isExistModuleDatabase } from '../templates/settings/database';
import { isExistsWord } from '../functions/common';

// #!/usr/bin / env node
// import { createDatabase } from '../src/templates/settings/database';
// import { exec } from 'child_process';
// import { createServerHttp } from '../src/templates/settings/server';
// createDatabase();
// exec('npm i promise-mysql', (error, stdout, stderr) => {
//     console.log(stdout);
// });



export const addUtilities = async (params: string) => {
    // console.log(arrayParams.length);
    let choices = [];
    if (!isExistModuleDatabase()) choices.push({ name: 'Database(MySql)', value: 'db:mysql' });
    if (!isExistModuleWs()) choices.push({ name: 'WS (SocketIo)', value: 'ws' });

    if (choices.length > 0) {
        if (params != undefined) {
            interpretAnswer(params);
        } else
            await inquirer.prompt({
                type: 'list',
                name: 'utilities',
                message: 'Select the module to add: ',
                choices
            }).then((answer) => {
                interpretAnswer(answer.utilities);
            });
    } else console.log(ansiColors.blueBright('The modules are already added'));
}

const interpretAnswer = async (answer: string) => {
    switch (answer) {
        case 'ws':
            const pathServerWs = path.resolve('') + '/' + config1.dir + '/settings/server/' + config1.subDir.settings.server.files[1];
            if (!fs.existsSync(pathServerWs)) {
                console.log("Installing packages...");
                exec('npm i socket.io', async (error, stdout, stderr) => {
                    if (!error && stdout != '' && !stderr) {
                        console.log(ansiColors.blueBright('✓ Done'));
                        createServerWs();
                        createRouteWs();
                        createControllerWs();
                    }
                    else
                        console.log(error || stderr);
                });
            } else console.error(ansiColors.redBright('A module \'WS (SocketIo)\' has already been initialized'));

            break;

        case 'db:mysql':
            console.log("Installing packages...");
            exec('npm i promise-mysql', (error, stdout, stderr) => {
                if (!error && stdout != '' && !stderr) {
                    console.log(ansiColors.blueBright('✓ Done'));
                    fs.mkdirSync(path.resolve() + '/' + config1.dir + '/models', { recursive: true });
                    createDatabase();
                    createModelCore();
                } else
                    console.log(error || stderr);
            });
            break;
        default:
            console.log(ansiColors.redBright('Invalid attribute'));
            exit(1);
            break;
    }
}