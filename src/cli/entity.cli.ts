import inquirer from 'inquirer';
import { addPrefix, getIndexSeparator } from '../functions/common';
import { createController } from '../templates/controller';
import { createModel } from '../templates/model';
import { createRouter } from '../templates/route';

export const entity = async () => {
    let entity: string;
    await inquirer.prompt({
        type: 'input',
        name: 'entity',
        message: 'Write the name of the entity: ',
    }).then((answer) => {
        entity = answer.entity;
        const upperCamelCase = entity.charAt(0).toUpperCase() + entity.slice(1);
        let indexSeparator = getIndexSeparator(entity).index;
        let nameRoute = addPrefix(indexSeparator, entity, 'Router');
        let nameClassController = addPrefix(indexSeparator, upperCamelCase, 'Controller');
        let nameClassModel = addPrefix(indexSeparator, upperCamelCase, 'Model');

        createRouter(nameRoute, answer.entity, nameClassController);
        createController(nameClassController, answer.entity, nameClassModel);
        createModel(nameClassModel, answer.entity);
    });
}



