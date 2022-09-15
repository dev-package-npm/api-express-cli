import inquirer from 'inquirer';
import { exec } from 'child_process';
import ansiColors from 'ansi-colors';
import { dir } from '../config/structure-configuration.json';
import fs, { promises } from 'fs';
import { exit } from 'process';
import { pathModelCore } from '../templates/core/models/model-core';
import { pathDatabase } from '../templates/settings/database';

// TODO: todo por terminar.
export const removeModules = async (params: Array<string>) => {
    // console.log(arrayParams.length);
    let choices = [];
    if (fs.existsSync('')) {

    }
    if (params != undefined && params.length != 0) {
        interpretAnswer(params[0]);
    } else
        await inquirer.prompt({
            type: 'list',
            name: 'utilities',
            message: 'Select the module to remove: ',
            choices: [
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
        case 'db:mysql':
            if (fs.existsSync(pathDatabase + 'database.ts') && fs.existsSync(pathModelCore + 'models.ts')) {
                exec('npm r promise-mysql', async (error, stdout, stderr) => {
                    if (!error && stdout != '' && !stderr) {
                        // createDatabase();
                        if (fs.existsSync(pathDatabase + 'database.ts')) await promises.unlink(pathDatabase + 'database.ts');

                        if (fs.existsSync(pathModelCore + 'models.ts')) {
                            await promises.unlink(pathModelCore + 'models.ts')
                            if (fs.readdirSync(pathModelCore).length == 0)
                                fs.rmdirSync(pathModelCore);
                        };
                        // createModelCore();
                    } else
                        console.log(error || stderr);
                });
            }
            else console.log(ansiColors.yellowBright('No module added'));

            break;
        default:
            console.log(ansiColors.redBright('Invalid attribute'));
            exit(1);
            break;
    }
}