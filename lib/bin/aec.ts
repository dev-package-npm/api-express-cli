#!/usr/bin/env node
import ansiColors from 'ansi-colors';
import fs from 'fs';
import path from 'path';


import { Entities } from '../class/entities.class';
import inquirer from 'inquirer';


export default class Aec extends Entities {
    //#region Private properties
    private input: string[];
    private abrevCommand: string = 'aec';
    private fullCommand: string = 'api-express-cli';
    private pathPackage = path.join(path.resolve(), '/package.json');

    private help: string = `
Example command
    ${ansiColors.cyan(this.abrevCommand + ' or ' + this.fullCommand + '<command> --help ')}More information
    ${ansiColors.cyan(this.abrevCommand + ' or ' + this.fullCommand + '<flags> <options> ')}More information

COMMAND LINE FLAGS
    ${ansiColors.cyan('init, in ')}Initialize a folder structure for the api, with some utilities.
    ${ansiColors.cyan('entity, e ')}Create a set of files: route, controller and model.
    ${ansiColors.cyan('route, r ')}Create a route with the specified name.
    ${ansiColors.cyan('controller, c ')}Create a controller with the specified name.
    ${ansiColors.cyan('model, m ')}Create a model with the specified name.
    ${ansiColors.cyan('add, ad ')}Allow adding new features.
    ${ansiColors.cyan('remove, rm ')}Removes a package, which is added with the --add command.
    ${ansiColors.cyan('--help, -h ')}Print this message.
    ${ansiColors.cyan('--version, -v ')}Print version with package.

COMMAND OPTIONS
    ${ansiColors.cyan('--name ')}Name files ${ansiColors.redBright('Not applied')}.
    ${ansiColors.cyan('--add ')}Name module.`;

    private helpInitial: string = `
Example command
    ${ansiColors.cyan(this.abrevCommand + ' or ' + this.fullCommand + ' <flags> <name> ')}

COMMAND LINE FLAGS
    ${ansiColors.cyan('create, c ')}Create project name with given name.
    ${ansiColors.cyan('--help, -h ')}Print this message.
    ${ansiColors.cyan('--version, -v ')}Print version with package.
`;
    //#endregion

    constructor() {
        super();
        //? Takes the data entered by the terminal, and stores it
        process.title = `${Array.from(process.argv).slice(2).join(" ")}`;
        this.input = process.title.split(" ");
    }

    async interpreInput(): Promise<void> {
        try {
            const params = this.input[0];
            // console.log(params);
            if (params === "--help" || params === "-h" || params == "") {
                if (this.validateQuantityArguments(this.input, 1))
                    this.printHelp();
            }
            else if (params == '-v' || params == '--version') {
                if (this.validateQuantityArguments(this.input, 1))
                    console.log('Version', ansiColors.cyan(await this.getVersion()));
            }
            else if (fs.existsSync(this.pathPackage)) {
                if (!fs.existsSync(this.pathIndexApi) && (params != 'init' && params != 'in'))
                    throw new Error(ansiColors.blueBright('You must initialize your project'));

                if (params == 'init' || params == 'in') {
                    await this.startStructure();
                    await this.interpretAttibutes(this.input);
                }
                else if (params == 'entity' || params == 'e') {
                    if (this.isExistModuleDatabase())
                        await this.entity();
                    else throw new Error(ansiColors.yellowBright('You can\'t create an entity because you haven\'t added the database module. ') + ansiColors.blueBright(`Use aec or api-express-cli add db:mysql`));
                }
                else if (params == 'route' || params == 'r') {
                    await this.route();
                }
                else if (params == 'controller' || params == 'c') {
                    await this.controller();
                }
                else if (params == 'model' || params == 'm') {
                    if (fs.existsSync(this.pathModel) && fs.existsSync(path.join(this.pathSettings, this.structureProject.subDir.settings.files.database)))
                        await this.model();
                    else throw new Error(ansiColors.yellowBright('You can\'t create an entity because you haven\'t added the database module. ') + ansiColors.blueBright('Use aec or api-express-cli add db:mysql'));
                }
                else if (params == 'add' || params == 'ad') {
                    await this.addUtilities(this.input.slice(1));
                }
                else if (params == 'remove' || params == 'rm') {
                    await this.removeModules(this.input.slice(1));
                }
                else throw new Error(ansiColors.yellowBright('Command is not valid'));
            }
            else if (params == 'create' || params == 'c') {
                console.log(this.input);
            }
            else throw new Error(ansiColors.yellowBright('Command is not valid'));
        } catch (error: any) {
            console.error(error.message);
        }
    }

    //#region Private methods
    private printHelp(): void {
        if (fs.existsSync(this.pathPackage))
            console.log(this.help);
        else console.log(this.helpInitial);
    }

    private validateQuantityArguments(params: string[], quantity: number): boolean {
        if (params.length != quantity) {
            console.log(ansiColors.redBright('This action does not allow any arguments'));
            return false;
        }
        else return true;
    }

    private async interpretAttibutes(input: Array<string>): Promise<void> {
        try {
            if (input.length > 2) {
                var attributes = input.slice(1);
                switch (attributes[0]) {
                    case '--add':
                        attributes = attributes.slice(1);
                        await this.addUtilities(attributes);
                        break;
                    case '--name':
                        break;
                    default:
                        throw new Error(ansiColors.redBright('Invalid attribute'));
                        break;
                }
            } else if (input.length < 1) throw new Error('A value is expected in the argument');
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async interpretAnswer(answer: string, action: 'add' | 'rm' = 'add') {
        try {
            switch (answer) {
                case 'ws':
                    if (action == 'add')
                        await this.initWs(answer);
                    else if (action == 'rm')
                        await this.removeWs(answer);
                    break;
                case 'db:mysql':
                    if (action == 'add')
                        await this.initDatabase(answer);
                    else if (action == 'rm') {
                        await this.removeDatabase(answer);
                    }
                    break;
                default:
                    throw new Error(ansiColors.redBright(ansiColors.redBright(`Invalid '${answer}' value`)));
                    break;
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    //#region 
    private async route() {
        try {
            await inquirer.prompt({
                type: 'input',
                name: 'route',
                message: 'Write the name of the route: ',
            }).then(async (answer) => {
                let route: string;
                route = answer.route;
                let indexSeparator = this.getIndexSeparator(route).index;
                let nameRoute = this.addPrefix(indexSeparator, route, 'Router');
                if (fs.existsSync(this.pathRoute + this.replaceAll(answer.route, '-') + `.${this.fileNameRoutes}`)) {
                    console.log(ansiColors.redBright(`Router file '${answer.route}' already exists`));
                    await inquirer.prompt({
                        type: 'confirm',
                        name: 'res',
                        message: `you want to override the '${answer.route}' router`,
                        default: false
                    }).then(async (answer2) => {
                        if (answer2.res)
                            await this.createRouter(nameRoute, answer.route);
                    });
                } else
                    await this.createRouter(nameRoute, answer.route);
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async controller() {
        try {
            let controller: string;
            await inquirer.prompt({
                type: 'input',
                name: 'controller',
                message: 'Write the name of the controller: ',
            }).then(async (answer) => {
                controller = answer.controller;
                controller = controller.charAt(0).toUpperCase() + controller.slice(1);
                let indexSeparator = this.getIndexSeparator(controller).index;
                let nameClass = this.addPrefix(indexSeparator, controller, 'Controller');
                if (fs.existsSync(this.pathControllers + this.replaceAll(answer.controller, '-') + `.${this.fileNameController}`)) {
                    console.log(ansiColors.redBright(`Controller '${answer.controller}' already exists`));
                    await inquirer.prompt({
                        type: 'confirm',
                        name: 'res',
                        message: `you want to override the '${answer.controller}' controller`,
                        default: false
                    }).then(async (answer2) => {
                        if (answer2.res)
                            await this.createController(nameClass, answer.controller);
                    });
                } else
                    await this.createController(nameClass, answer.controller);
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async model() {
        try {
            await inquirer.prompt({
                type: 'input',
                name: 'model',
                message: 'Write the name of the model: ',
            }).then(async (answer) => {
                let model: string;
                model = String(answer.model).toLocaleLowerCase();
                model = model.charAt(0).toUpperCase() + model.slice(1);
                let indexSeparator = this.getIndexSeparator(model).index;
                let nameClass = this.addPrefix(indexSeparator, model, 'Model');
                if (fs.existsSync(this.pathModel + this.replaceAll(answer.model, '-') + '.model.ts')) {
                    console.log(ansiColors.redBright(`Controller '${answer.model}' already exists`));
                    await inquirer.prompt({
                        type: 'confirm',
                        name: 'res',
                        message: `you want to override the '${answer.model}' model`,
                        default: false
                    }).then((answer2) => {
                        if (answer2.res)
                            this.createModel(nameClass, answer.model);
                    });
                } else
                    this.createModel(nameClass, answer.model);
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async entity() {
        try {
            let entity: string;
            await inquirer.prompt({
                type: 'input',
                name: 'entity',
                message: 'Write the name of the entity: ',
            }).then(async (answer) => {
                entity = answer.entity;
                const upperCamelCase = entity.charAt(0).toUpperCase() + entity.slice(1);
                let indexSeparator = this.getIndexSeparator(entity).index;
                let nameRoute = this.addPrefix(indexSeparator, entity, 'Router');
                let nameClassController = this.addPrefix(indexSeparator, upperCamelCase, 'Controller');
                let nameClassModel = this.addPrefix(indexSeparator, upperCamelCase, 'Model');

                await this.createRouter(nameRoute, answer.entity, nameClassController);
                await this.createController(nameClassController, answer.entity, nameClassModel);
                this.createModel(nameClassModel, answer.entity);
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async addUtilities(params: Array<string>): Promise<void> {
        try {
            let choices = [];
            if (!this.isExistModuleDatabase()) choices.push({ name: 'Database(MySql)', value: 'db:mysql' });
            if (!this.isExistModuleWs()) choices.push({ name: 'WS (SocketIo)', value: 'ws' });
            if (choices.length > 0) {
                if (params != undefined) {
                    for (const item of params) {
                        await this.interpretAnswer(item);
                    }
                } else
                    await inquirer.prompt({
                        type: 'list',
                        name: 'utilities',
                        message: 'Select the module to add: ',
                        choices
                    }).then(async (answer) => {
                        await this.interpretAnswer(answer.utilities);
                    });
            } else throw new Error(ansiColors.blueBright('The modules are already added'));
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    private async removeModules(params: Array<string>) {
        try {
            let choices = [];

            if (this.isExistModuleDatabase())
                choices.push({ name: 'Database(MySql)', value: 'db:mysql' });
            if (this.isExistModuleWs())
                choices.push({ name: 'WS (SocketIo)', value: 'ws' });

            if (choices.length > 0) {
                if (params != undefined && params.length != 0) {
                    for (const item of params) {
                        await this.interpretAnswer(item, 'rm');
                    }
                } else
                    await inquirer.prompt({
                        type: 'list',
                        name: 'utilities',
                        message: 'Select the module to remove: ',
                        choices
                    }).then(async (answer) => {
                        await this.interpretAnswer(answer.utilities, 'rm');
                    });
            } else throw new Error(ansiColors.blueBright('No modules to remove'));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    //#endregion
    //#endregion
}
