import ansiColors from 'ansi-colors';
import inquirer from 'inquirer';
import fs from 'node:fs';
import { addPrefix, getIndexSeparator, replaceAll } from '../functions/common';
import { createModel, pathModel } from '../templates/model';

export const model = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'model',
        message: 'Write the name of the model: ',
    }).then(async (answer) => {
        let model: string;
        model = String(answer.model).toLocaleLowerCase();
        model = model.charAt(0).toUpperCase() + model.slice(1);
        let indexSeparator = getIndexSeparator(model).index;
        let nameClass = addPrefix(indexSeparator, model, 'Model');
        if (fs.existsSync(pathModel + replaceAll(answer.model, '-') + '.model.ts')) {
            console.log(ansiColors.redBright(`Controller '${answer.model}' already exists`));
            await inquirer.prompt({
                type: 'confirm',
                name: 'res',
                message: `you want to override the '${answer.model}' model`,
                default: false
            }).then((answer2) => {
                if (answer2.res)
                    createModel(nameClass, answer.model);
            });
        } else
            createModel(nameClass, answer.model);
    });
}



