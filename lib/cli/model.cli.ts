import inquirer from 'inquirer';
import { addPrefix, getIndexSeparator } from '../functions/common';
import { createModel } from '../templates/model';

export const model = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'model',
        message: 'Write the name of the model: ',
    }).then((answer) => {
        let model: string;
        model = String(answer.model).toLocaleLowerCase();
        model = model.charAt(0).toUpperCase() + model.slice(1);
        let indexSeparator = getIndexSeparator(model).index;
        let nameClass = addPrefix(indexSeparator, model, 'Model');
        createModel(nameClass, answer.model);
    });
}



