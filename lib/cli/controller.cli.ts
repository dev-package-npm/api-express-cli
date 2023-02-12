import inquirer from 'inquirer';
import { addPrefix, getIndexSeparator } from '../functions/common';
import { createController } from '../templates/controller';

export const controller = async () => {
    let controller: string;
    await inquirer.prompt({
        type: 'input',
        name: 'controller',
        message: 'Write the name of the controller: ',
    }).then((answer) => {
        controller = answer.controller;
        controller = controller.charAt(0).toUpperCase() + controller.slice(1);
        let indexSeparator = getIndexSeparator(controller).index;
        let nameClass = addPrefix(indexSeparator, controller, 'Controller');
        createController(nameClass, answer.controller);
    });
}




