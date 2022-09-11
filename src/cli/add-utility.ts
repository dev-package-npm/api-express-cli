import inquirer from 'inquirer';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readLine from 'readline';
import { createController } from '../templates/controller';
import { createModel } from '../templates/model';
import { createRouter } from '../templates/route';
import { createServerWs } from '../templates/websocket/server-ws';
import { createControllerWs } from '../templates/websocket/controller-ws';
import { createRouteWs } from '../templates/websocket/route-ws';

export const addUtilities = async (params: string) => {
    const arrayParams = params.split(' ');
    // console.log(arrayParams.length);
    if (arrayParams.length > 1) {

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
                    value: 'db'
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
                    const pathServer = path.resolve('') + '/src/settings/server/';

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

        case 'db':
            break;
    }
}