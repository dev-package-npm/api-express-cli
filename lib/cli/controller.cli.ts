import ansiColors from 'ansi-colors';
import inquirer from 'inquirer';
import fs from 'node:fs';
import { addPrefix, getIndexSeparator, replaceAll } from '../functions/common';
import { createController, pathController } from '../templates/controller';

export const controller = async () => {
    let controller: string;
    await inquirer.prompt({
        type: 'input',
        name: 'controller',
        message: 'Write the name of the controller: ',
    }).then(async (answer) => {
        controller = answer.controller;
        controller = controller.charAt(0).toUpperCase() + controller.slice(1);
        let indexSeparator = getIndexSeparator(controller).index;
        let nameClass = addPrefix(indexSeparator, controller, 'Controller');
        if (fs.existsSync(pathController + replaceAll(answer.controller, '-') + '.controller.ts')) {
            console.log(ansiColors.redBright(`Controller '${answer.controller}' already exists`));
            await inquirer.prompt({
                type: 'confirm',
                name: 'res',
                message: `you want to override the '${answer.controller}' controller`,
                default: false
            }).then((answer2) => {
                if (answer2.res)
                    createController(nameClass, answer.controller);
            });
        } else
            createController(nameClass, answer.controller);
    });
}




