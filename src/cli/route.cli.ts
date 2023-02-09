import inquirer from 'inquirer';
import { addPrefix, getIndexSeparator } from '../functions/common';
import { createRouter } from '../templates/route';

export const route = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'route',
        message: 'Write the name of the route: ',
    }).then((answer) => {
        let route: string;
        route = answer.route;
        let indexSeparator = getIndexSeparator(route).index;
        let nameRoute = addPrefix(indexSeparator, route, 'Router');
        createRouter(nameRoute, answer.route);
    });
}