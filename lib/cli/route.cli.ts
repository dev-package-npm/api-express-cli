import ansiColors from 'ansi-colors';
import inquirer from 'inquirer';
import fs from 'node:fs';
import { addPrefix, getIndexSeparator, replaceAll } from '../functions/common';
import { createRouter, pathRoute } from '../templates/route';

export const route = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'route',
        message: 'Write the name of the route: ',
    }).then(async (answer) => {
        let route: string;
        route = answer.route;
        let indexSeparator = getIndexSeparator(route).index;
        let nameRoute = addPrefix(indexSeparator, route, 'Router');
        if (fs.existsSync(pathRoute + replaceAll(answer.route, '-') + '.route.ts')) {
            console.log(ansiColors.redBright(`Router file '${answer.route}' already exists`));
            await inquirer.prompt({
                type: 'confirm',
                name: 'res',
                message: `you want to override the '${answer.route}' router`,
                default: false
            }).then((answer2) => {
                if (answer2.res)
                    createRouter(nameRoute, answer.route);
            });
        } else
            createRouter(nameRoute, answer.route);
    });
}