import inquirer from 'inquirer';
import { createController } from '../templates/controller';
import { createModel } from '../templates/model';
import { createRouter } from '../templates/route';

export const entity = async () => {
    let entity: string;
    await inquirer.prompt({
        type: 'input',
        name: 'entity',
        message: 'Escribe el nombre de la entidad: ',
    }).then((answer) => {
        entity = answer.entity;
        let nameRoute = `${entity}Router`;
        const upperCamelCase = entity.charAt(0).toUpperCase() + entity.slice(1);
        let nameClassController = `${upperCamelCase}Controller`;
        let nameClassModel = `${upperCamelCase}Model`;

        let indexDash = entity.search('-');
        if (indexDash != -1) {
            nameRoute = entity.slice(0, indexDash) + entity.charAt(indexDash + 1).toUpperCase() + entity.slice(indexDash + 2);
            nameRoute += 'Router';
        }
        if (indexDash != -1) {
            nameClassController = entity.slice(0, indexDash) + entity.charAt(indexDash + 1).toUpperCase() + entity.slice(indexDash + 2);
            nameClassController += 'Controller';
        }
        if (indexDash != -1) {
            nameClassModel = entity.slice(0, indexDash) + entity.charAt(indexDash + 1).toUpperCase() + entity.slice(indexDash + 2);
            nameClassModel += 'Model';
        }
        createRouter(nameRoute, answer.entity, nameClassController);
        createController(nameClassController, answer.entity, nameClassModel);
        createModel(nameClassModel, answer.entity);
    });
}



