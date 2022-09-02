import inquirer from 'inquirer';
import { createController } from '../templates/controller';

export const controller = async () => {
    let controller: string;
    await inquirer.prompt({
        type: 'input',
        name: 'controller',
        message: 'Escribe el nombre del controlador: ',
    }).then((answer) => {
        controller = answer.controller;
        controller = controller.charAt(0).toUpperCase() + controller.slice(1);
        let nameClass = `${controller}Controller`;
        let indexDash = controller.search('-');
        if (indexDash != -1) {
            nameClass = controller.slice(0, indexDash) + controller.charAt(indexDash + 1).toUpperCase() + controller.slice(indexDash + 2);
            nameClass += 'Model';
        }
        createController(nameClass, answer.controller);
    });
}




