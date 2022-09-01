import inquirer from 'inquirer';
import { createModel } from "./functions/index.function";

export const model = async () => {
    await inquirer.prompt({
        type: 'input',
        name: 'model',
        message: 'Write the name of the model: ',
    }).then((answer) => {
        let model: string;
        model = answer.model;
        model = model.charAt(0).toUpperCase() + model.slice(1);
        let nameClass = `${model}Model`;
        let indexDash = model.search('-');
        if (indexDash != -1) {
            nameClass = model.slice(0, indexDash) + model.charAt(indexDash + 1).toUpperCase() + model.slice(indexDash + 2);
            nameClass += 'Model';
        }
        createModel(nameClass, answer.model);
    });
}



