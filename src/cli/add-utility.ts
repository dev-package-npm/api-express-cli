import inquirer from 'inquirer';
import { exec } from 'child_process';
import ansiColors from 'ansi-colors';
import { dir } from '../config/structure-configuration.json';
import fs from 'fs';
import path from 'path';
import readLine from 'readline';
import { createController } from '../templates/controller';
import { createModel } from '../templates/model';
import { createRouter } from '../templates/route';
import { createServerWs } from '../templates/websocket/server-ws';
import { createControllerWs } from '../templates/websocket/controller-ws';
import { createRouteWs } from '../templates/websocket/route-ws';
import { exit } from 'process';
import { createModelCore } from '../templates/core/models/model-core';
import { createDatabase } from '../templates/settings/database';

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
    if (params != undefined) {
        interpretAnswer(params);
    } else
        await inquirer.prompt({
            type: 'list',
            name: 'utilities',
            message: 'Select the module to add: ',
            choices: [
                {
                    name: 'WS (SocketIo)',
                    value: 'ws'
                },
                {
                    name: 'Database(MySql)',
                    value: 'db:mysql'
                }
            ]
        }).then((answer) => {
            interpretAnswer(answer.utilities);
        });
}

const interpretAnswer = (answer: string) => {
    switch (answer) {
        case 'ws':
            exec('npm i socket.io', (error, stdout, stderr) => {
                if (!error && stdout != '' && !stderr) {
                    createServerWs();
                    createRouteWs();
                    createControllerWs();
                    // Edit server http, import and inicialize
                    const pathServer = path.resolve('') + '/' + dir + '/settings/server/';

                    const content = fs.createReadStream(pathServer + 'server.ts', 'utf8');
                    const lector = readLine.createInterface({ input: content });
                    let modifiedContent = '';
                    lector.on('line', line => {
                        if (line.includes('// Local import') != false) {
                            modifiedContent += line;
                            modifiedContent += '\nimport WebsocketServer from "./ws-server";';
                        }
                        else if (line.includes('server: http.Server;') != false) {
                            modifiedContent += line;
                            modifiedContent += '\n\twsServer: WebsocketServer;\n';
                        }
                        else if (line.includes('new http.Server(this.app);') != false) {
                            modifiedContent += line;
                            modifiedContent += '\n\t\tthis.wsServer = new WebsocketServer(this.server);\n';
                        }
                        else modifiedContent += line + '\n';

                    });
                    lector.on('close', () => {
                        fs.writeFileSync(pathServer + 'server.ts', modifiedContent);
                    });
                }
                else
                    console.log(error || stderr);
            });
            break;

        case 'db:mysql':
            exec('npm i promise-mysql', (error, stdout, stderr) => {
                if (!error && stdout != '' && !stderr) {
                    fs.mkdirSync(path.resolve() + '/' + dir + '/models', { recursive: true });
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