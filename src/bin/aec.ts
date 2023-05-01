#!/usr/bin/env node
import ansiColors from 'ansi-colors';
import fs from 'fs';
import { copySync } from 'fs-extra';
import path from 'path';

import { textSync } from 'figlet';
import inquirer from 'inquirer';
import { Cuby } from 'cuby-orm';

import { Entities } from '../class/entities.class';

const cuby = new Cuby();

export default class Aec extends Entities {
    //#region Private properties
    private input: string[];
    private auxInput: string[] = [];
    private abrevCommand: string = 'aec';
    private pathPackage = path.join(path.resolve(), '/package.json');
    private regExpEspecialCharacter: RegExp = /[!@#$%^&*()+={}\[\]|\\:;'",.<>/?]/;

    private entityHelp: string = `${ansiColors.cyan('entity, e ')}Create a set of files: route, controller and model.`;
    private help: string = `
Example command
    ${ansiColors.cyan(this.abrevCommand + ' <command> --help ')}More information
    ${ansiColors.cyan(this.abrevCommand + ' <flags> <options> ')}More information

COMMAND LINE FLAGS ${this.isExistModuleDatabase() ? '\n    ' + this.entityHelp : ''}
    ${ansiColors.cyan('service, s ')}Create a service with the given name.
    ${ansiColors.cyan('route, r ')}Create a route with the specified name.
    ${ansiColors.cyan('r+c ')}Create a route and controller with the specified name.
    ${ansiColors.cyan('controller, c ')}Create a controller with the specified name.
    ${ansiColors.cyan('add, ad ')}Allow adding new features or modules.
    ${ansiColors.cyan('remove, rm ')}Removes a package, which is added with the --add command.
    ${ansiColors.cyan('--help, -h ')}Print this message.
    ${ansiColors.cyan('--version, -v ')}Print version with package.

COMMAND OPTIONS
    ${ansiColors.cyan('--name ')}Name files ${ansiColors.redBright('Not applied')}.
    ${ansiColors.cyan('--add ')}Name module.`;

    private helpInitial: string = `
Example command
    ${ansiColors.cyan(this.abrevCommand + ' <flags> <name> ')}

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

    async interpreInput(input?: string[]): Promise<void> {
        try {
            input !== undefined ? this.input = input : '';
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

                if (params == 'service' || params == 's') {
                    console.log(this.input.slice(1));
                }
                else if (this.isExistModuleDatabase() && params == 'entity' || params == 'e') {
                    this.auxInput = this.input;
                    this.auxInput[0] = 'db:model';
                    await this.entity(this.input.slice(1));
                }
                else if (params == 'route' || params == 'r') {
                    await this.route(this.input.slice(1));
                }
                else if (params == 'controller' || params == 'c') {
                    await this.controller(this.input.slice(1));
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
                await this.initProject(this.input.slice(1));
            }
            else throw new Error(ansiColors.yellowBright('Command is not valid'));
        } catch (error: any) {
            console.error(error.message);
        }
    }

    //#region Private methods
    private printHelp(): void {
        console.log(ansiColors.yellow(textSync(this.abrevCommand, { width: 80 })));

        if (fs.existsSync(this.pathPackage))
            console.log(this.help, this.isExistModuleDatabase() ? cuby.getHelp() : '');
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
                case 'db':
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

    private async initProject(params: Array<string>) {
        try {
            if (params.length != 0) {
                if (this.regExpEspecialCharacter.test(params[0]) || params[0].charAt(0) == '-' || params[0].charAt(0) == '_')
                    throw new Error(ansiColors.redBright("Unsupported characters: " + params[0]));
                // TODO: quitar 
                if (fs.existsSync(path.join(path.resolve(), params[0])))
                    fs.rmSync(path.join(path.resolve(), params[0]), { recursive: true });

                if (!fs.existsSync(path.join(path.resolve(), params[0]))) {
                    copySync(path.join(__dirname, '../../templates/ts/api-base-express'), params[0], {
                        filter: (src: string) => { return !/node_modules|dist/.test(src); },
                        overwrite: true
                    });
                    process.chdir(`./${params[0]}`);
                    await this.executeTerminal('npm i');
                    await this.setPath();
                    await this.writeHashInKey(path.join(process.cwd(), './.env'));
                    this.executeTerminal('code --version').then(async () => {
                        await inquirer.prompt({
                            type: 'confirm',
                            name: 'res',
                            default: true,
                            message: 'Would you like to open it with VS Code',
                        }).then(async (answer) => {
                            if (answer.res)
                                await this.executeTerminal('code .');
                        });
                    });
                }
                else throw new Error(ansiColors.yellowBright(`A project with name '${ansiColors.blueBright(params[0])}' already exists`));
            }
        } catch (error: any) {
            throw new Error(ansiColors.redBright(error.message));
        }
    }

    private async route(params: Array<string>) {
        try {
            if (params.length != 0) {
                for (const item of params) {
                    await this.executeAction(item, 'route')
                }
            } else
                await inquirer.prompt({
                    type: 'input',
                    name: 'route',
                    message: 'Write the name of the route: ',
                }).then(async (answer) => {
                    await this.executeAction(answer.route, 'route');
                });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async controller(params: Array<string>) {
        try {
            if (params.length != 0) {
                for (const item of params) {
                    await this.executeAction(item, 'controller')
                }
            } else
                await inquirer.prompt({
                    type: 'input',
                    name: 'controller',
                    message: 'Write the name of the controller: ',
                }).then(async (answer) => {
                    await this.executeAction(answer.controller, 'controller')
                });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async entity(params: Array<string>) {
        try {
            let entity: string;
            if (params.length != 0) {
                for (const item of params) {
                    await this.executeAction(item, 'entity');
                }
            } else
                await inquirer.prompt({
                    type: 'input',
                    name: 'entity',
                    message: 'Write the name of the entity: ',
                }).then(async (answer) => {
                    entity = answer.entity;
                    await this.executeAction(entity, 'entity');
                });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async addUtilities(params: Array<string>): Promise<void> {
        try {
            let choices = [];
            if (!this.isExistModuleDatabase()) choices.push({ name: 'Database (cuyb-orm)', value: 'db' });
            if (!this.isExistModuleWs()) choices.push({ name: 'WS (SocketIo)', value: 'ws' });

            if (choices.length > 0) {
                if (params.length != 0) {
                    for (const item of params) {
                        await this.interpretAnswer(item);
                    }
                } else
                    await inquirer.prompt({
                        type: 'checkbox',
                        name: 'utilities',
                        message: 'Select the module to add: ',
                        choices
                    }).then(async (answer) => {
                        for (const item of answer.utilities) {
                            await this.interpretAnswer(item);
                        }
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
                choices.push({ name: 'Database (cuby-orm)', value: 'db' });
            if (this.isExistModuleWs())
                choices.push({ name: 'WS (SocketIo)', value: 'ws' });

            if (choices.length > 0) {
                if (params != undefined && params.length != 0) {
                    for (const item of params) {
                        await this.interpretAnswer(item, 'rm');
                    }
                } else
                    await inquirer.prompt({
                        type: 'checkbox',
                        name: 'utilities',
                        message: 'Select the module to remove: ',
                        choices
                    }).then(async (answer) => {
                        for (const item of answer.utilities) {
                            await this.interpretAnswer(item, 'rm');
                        }
                    });
            } else throw new Error(ansiColors.blueBright('No modules to remove'));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async executeAction(value: string, type: 'entity' | 'route' | 'controller') {
        try {
            let indexSeparator = this.getIndexSeparator(value).index;
            let route = String(value).toLocaleLowerCase();
            let nameRoute = this.addPrefix(indexSeparator, route, 'Router');
            switch (type) {
                case 'entity':
                    if (this.regExpEspecialCharacter.test(value))
                        throw new Error(ansiColors.redBright('Special characters are not allowed within the value'));

                    let entity = String(value).toLocaleLowerCase();
                    const upperCamelCase = entity.charAt(0).toUpperCase() + entity.slice(1);
                    let nameClassController = this.addPrefix(indexSeparator, upperCamelCase, 'Controller');
                    let nameClassModelEntity = this.addPrefix(indexSeparator, upperCamelCase, 'Model');
                    await this.createRouter(nameRoute, entity, nameClassController);
                    await this.createController(nameClassController, entity, nameClassModelEntity);
                    await cuby.interpreInput(this.auxInput);
                    // this.createModel(nameClassModelEntity, entity);
                    break;

                case 'route':
                    if (fs.existsSync(this.pathRoute + this.replaceAll(route, '-') + `.${this.fileNameRoutes}`)) {
                        console.log(ansiColors.redBright(`Router file '${route}' already exists`));
                        await inquirer.prompt({
                            type: 'confirm',
                            name: 'res',
                            message: `you want to override the '${route}' router`,
                            default: false
                        }).then(async (answer2) => {
                            if (answer2.res)
                                await this.createRouter(nameRoute, route);
                        });
                    } else
                        await this.createRouter(nameRoute, route);
                    break;
                case 'controller':
                    let controller = String(value).toLocaleLowerCase();
                    controller = controller.charAt(0).toUpperCase() + controller.slice(1);
                    let nameClass = this.addPrefix(indexSeparator, controller, 'Controller');
                    if (fs.existsSync(this.pathControllers + this.replaceAll(controller, '-') + `.${this.fileNameController}`)) {
                        console.log(ansiColors.redBright(`Controller '${value.toLocaleLowerCase()}' already exists`));
                        await inquirer.prompt({
                            type: 'confirm',
                            name: 'res',
                            message: `you want to override the '${value.toLocaleLowerCase()}' controller`,
                            default: false
                        }).then(async (answer2) => {
                            if (answer2.res)
                                await this.createController(nameClass, value.toLocaleLowerCase());
                        });
                    } else
                        await this.createController(nameClass, value.toLocaleLowerCase());
                    break;
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    //#endregion
    //#endregion
}
