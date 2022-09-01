import inquirer from 'inquirer';
import { createRouter } from './functions/index.function';

export const route = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'route',
        message: 'Write the name of the route: ',
    }).then((answer) => {
        let route: string;
        route = answer.route;
        // route = route.charAt(0).toUpperCase() + route.slice(1);
        let nameRoute = `${route}Router`;
        let indexDash = route.search('-');
        if (indexDash != -1) {
            nameRoute = route.slice(0, indexDash) + route.charAt(indexDash + 1).toUpperCase() + route.slice(indexDash + 2);
            nameRoute += 'Router';
        }
        createRouter(nameRoute, answer.route);
    });
}