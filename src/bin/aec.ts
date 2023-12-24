#!/usr/bin/env node
import ansiColors from 'ansi-colors';
import fs from 'fs';
import { copySync } from 'fs-extra';
import path from 'path';

import { textSync } from 'figlet';

import { Entities } from '../class/entities.class';
import { checkbox, confirm, input, select } from '@inquirer/prompts';

type TAecOptions = 'entity' | 'route' | 'controller' | 'r+c'

export default class Aec extends Entities {
    //#region Private properties
    private input: string[];
    private auxInput: string[] = [];
    private abrevCommand: string = 'aec';
    private pathPackage = path.join(path.resolve(), '/package.json');
    private regExpEspecialCharacter: RegExp = /[!@#$%^&*()+={}\[\]|\\:;'",.<>/?]/;
    private pathCubyOrm = path.join(path.resolve(), '/node_modules/cuby-orm');

    private entityHelp: string = `${ansiColors.cyan('entity, e ')}Create a set of files: route, controller and model.`;
    private help: string = `
${ansiColors.yellowBright("api-express-cli")}
    Example command
        ${ansiColors.cyan(this.abrevCommand + ' <command> --help ')}More information
        ${ansiColors.cyan(this.abrevCommand + ' <flags> <options> ')}More information

    COMMAND LINE FLAGS ${this.isExistModuleDatabase() ? `
        ${this.entityHelp}` : ''}
        ${ansiColors.cyan('route, r ')}Create a route with the given name.
        ${ansiColors.cyan('r+c ')}Create a route and controller with the given name.
        ${ansiColors.cyan('controller, c ')}Create a controller with the given name.
        ${ansiColors.cyan('add, ad ')}Allow adding new features or modules.
        ${ansiColors.cyan('remove, rm ')}Removes one of the utilities that is added.

        ${ansiColors.cyan('--help, -h ')}Print this message.
        ${ansiColors.cyan('--version, -v ')}Print version with package.`;

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

    async interpretInput(input?: string[]): Promise<void> {
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
            else if (this.input[1] == '--help' || this.input[1] == '-h' && !params.includes('db')) {
                this.printHelpForCommand(this.input[0]);
            }
            else if (fs.existsSync(this.pathPackage)) {
                if (params.includes('db') && this.isExistModuleDatabase() && fs.existsSync(this.pathCubyOrm)) {
                    const { Cuby } = await import(this.pathCubyOrm);
                    const cuby = new Cuby();
                    await cuby.interpreInput(this.input);
                }
                else if (this.isExistModuleDatabase() && params == 'entity' || params == 'e') {
                    this.auxInput = this.input;
                    this.auxInput[0] = 'db:model';
                    await this.interpretActions({ params: this.input.slice(1), type: 'entity' });
                }
                else if (params == 'route' || params == 'r') {
                    await this.interpretActions({ params: this.input.slice(1), type: 'route' });
                }
                else if (params == 'controller' || params == 'c') {
                    await this.interpretActions({ params: this.input.slice(1), type: 'controller' });
                }
                else if (params == 'r+c') {
                    await this.interpretActions({ params: this.input.slice(1), type: 'r+c' });
                }
                else if (params == 'add' || params == 'ad') {
                    await this.modules({ params: this.input.slice(1), action: 'add' });
                }
                else if (params == 'remove' || params == 'rm') {
                    await this.modules({ params: this.input.slice(1), action: 'rm' });
                }
                else throw new Error(ansiColors.yellowBright('Command is not valid'));
            }
            else if (params == 'create' || params == 'c') {
                await this.createProject(this.input.slice(1));
            }
            else throw new Error(ansiColors.yellowBright('Command is not valid'));
        } catch (error: any) {
            console.error(error.message);
        }
    }

    //#region Private methods
    private async printHelp() {
        console.log(ansiColors.yellow(textSync(this.abrevCommand, { width: 80 })));
        console.log("(Api Express Cli)");
        if (fs.existsSync(this.pathPackage)) {
            console.log(this.help);
            if (fs.existsSync(this.pathCubyOrm) && this.isExistModuleDatabase()) {
                const { Cuby } = await import(this.pathCubyOrm);
                const cuby = new Cuby();
                const nombresMetodos = Object.getOwnPropertyNames(Cuby.prototype)
                    .filter((nombre) => {
                        // Filtrar solo los métodos (excluir constructor y propiedades)
                        return (
                            typeof Cuby.prototype[nombre] === 'function' &&
                            nombre !== 'constructor'
                        );
                    });
                // console.log(nombresMetodos);
                console.log(cuby.getHelp().split('\n')?.filter((value: any) => (!value.includes('cuby') || value.includes('db:config'))).join('\n'));
            }
        }
        else console.log(this.helpInitial);
    }

    private validateQuantityArguments(params: string[], quantity: number): boolean {
        if (params.length != quantity) {
            console.log(ansiColors.redBright('This action does not allow any arguments'));
            return false;
        }
        else return true;
    }

    protected printHelpForCommand(params: string, abrevCommand?: string): void {
        try {
            const objParams: any = {};
            switch (params) {
                case 'create':
                    console.log(`${abrevCommand || this.abrevCommand} ${params} ${ansiColors.blueBright('<api-example> --lang ts | js')}`);
                    break;
                default:
                    throw new Error(ansiColors.yellowBright(`The ${ansiColors.blueBright(params)} command has no help `));
                    break;
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async interpretAttibutes(input: Array<string>): Promise<void> {
        try {
            if (input.length > 2) {
                var attributes = input.slice(1);
                switch (attributes[0]) {
                    case '--add':
                        attributes = attributes.slice(1);
                        await this.modules({ params: attributes, action: 'add' });
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

    private async interpretAnswerForModules(answer: string, action: 'add' | 'rm' = 'add') {
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

    private async createProject(params: Array<string>) {
        try {
            if (params.length != 0) {
                if (this.regExpEspecialCharacter.test(params[0]) || params[0].charAt(0) == '-' || params[0].charAt(0) == '_')
                    throw new Error(ansiColors.redBright("Unsupported characters: " + params[0]));

                let language: string = 'ts';
                const enableJs = false;
                if (params.length == 3 && params[1] == '--lang' && (String(params[2]).toLocaleLowerCase() == 'ts' || String(params[2]).toLocaleLowerCase() == 'js'))
                    language = enableJs ? params[2] : 'ts';
                else if (params.length != 1) throw new Error(ansiColors.redBright("One of the values passed are not valid, or values are missing"));
                else {
                    const typeLanguage = await select({
                        message: 'Select the language', choices: [
                            { value: 'TS', name: 'Typescript' },
                            { value: 'JS', name: 'Javascript', disabled: true }
                        ],
                    });
                    language = typeLanguage != undefined ? typeLanguage : 'ts';
                }

                if (!fs.existsSync(path.join(path.resolve(), params[0]))) {
                    this.spinnies.add('spinner-create', { text: ansiColors.blueBright("Creating project and installing dependencies.") });
                    const dirProject = path.join(__dirname, `../../templates/${language.toLocaleLowerCase()}/api-base-express/`);
                    copySync(dirProject, params[0], {
                        filter: (src: string) => {
                            let srcFilter = src.split('api-base-express')[1];
                            return !/node_modules|dist|.gitkeep/.test(srcFilter);
                        },
                        overwrite: true
                    });

                    process.chdir(`./${params[0]}`);
                    await this.executeTerminal(`npm pkg set name=${params[0]}`);
                    await this.executeTerminal('npm i');
                    await this.setPath();
                    await this.writeHashInKey(path.join(process.cwd(), './.env'));
                    this.spinnies.succeed('spinner-create');
                    this.executeTerminal('code --version').then(async () => {
                        const answer = await confirm({ default: true, message: 'Would you like to open it with VS Code', });
                        if (answer)
                            await this.executeTerminal('code .');
                    });
                }
                else throw new Error(ansiColors.yellowBright(`A project with name '${ansiColors.blueBright(params[0])}' already exists`));

            } else throw new Error(ansiColors.redBright("No project name specified. ") + ansiColors.blueBright(`Use ${this.abrevCommand} create -h for more help`));
        } catch (error: any) {
            if (this.spinnies.hasActiveSpinners())
                this.spinnies.fail('spinner-create');
            throw new Error(ansiColors.redBright(error.message));
        }
    }

    private async interpretActions({ type, params }: { type: TAecOptions, params: string[] }) {
        try {
            const messageDictionary: { type: TAecOptions, message: string }[] = [
                { type: 'route', message: 'Write the name of the route or routes separated by space: ' },
                { type: 'controller', message: 'Write the name of the controller or controllers separated by space: ' },
                { type: 'entity', message: 'Write the name of the entity or entities separated by space: ' },
                { type: 'r+c', message: 'Write one or more separated by space' },
            ];

            const routes = params.length != 0 ? params : (await input({ message: (messageDictionary.filter((value) => value.type == type))[0].message })).split(' ');
            for (const item of routes) {
                await this.executeAction(item, type)
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async modules({ params, action }: { params: Array<string>, action: 'rm' | 'add' }) {
        try {
            let choices = [];

            if ((action == 'rm' && this.isExistModuleDatabase()) || (action == 'add' && !this.isExistModuleDatabase())) choices.push({ name: 'Database (cuby-orm)', value: 'db' });
            if ((action == 'rm' && this.isExistModuleWs()) || (action == 'add' && !this.isExistModuleWs)) choices.push({ name: 'WS (SocketIo)', value: 'ws' });

            if (choices.length > 0) {
                const modules = params.length != 0 ? params : await checkbox({ message: `Select the module to ${action == 'add' ? 'add' : 'remove'}: `, choices });

                for (const item of modules) {
                    await this.interpretAnswerForModules(item, action);
                }
            } else throw new Error(ansiColors.blueBright(action == 'rm' ? 'No modules to remove' : 'The modules are already added'));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async executeAction(value: string, type: TAecOptions) {
        try {
            if (this.regExpEspecialCharacter.test(value) || value.charAt(0) == '-' || value.charAt(0) == '_')
                throw new Error(ansiColors.redBright('Special characters are not allowed within the value'));

            let indexSeparator = this.getIndexSeparator(value).index;
            let route = String(value).toLocaleLowerCase();
            let nameRoute = this.addPrefix(indexSeparator, route, 'Router');

            let nameClassController;
            let nameClassModelEntity;
            switch (type) {
                case 'entity':
                    let entity = String(value).toLocaleLowerCase();
                    const upperCamelCase = entity.charAt(0).toUpperCase() + entity.slice(1);
                    nameClassController = this.addPrefix(indexSeparator, upperCamelCase, 'Controller');
                    nameClassModelEntity = this.addPrefix(indexSeparator, upperCamelCase, 'Model');
                    await this.createRouter({ nameRoute, inputRouter: entity, nameController: nameClassController });
                    await this.createController({ nameClass: nameClassController, inputController: entity, nameModel: nameClassModelEntity });
                    if (fs.existsSync(this.pathCubyOrm)) {
                        const { Cuby } = await import(this.pathCubyOrm);
                        const cuby = new Cuby();
                        await cuby.interpreInput(this.auxInput);
                    }
                    break;
                case 'route':
                    if (fs.existsSync(this.pathRoute + this.replaceAll(route, '-') + `.${this.fileNameRoutes}`)) {
                        console.log(ansiColors.redBright(`Router file '${route}' already exists`));
                        const answer = await confirm({ message: `Would you like to overwrite the ${route} route?`, default: false });

                        if (answer)
                            await this.createRouter({ nameRoute, inputRouter: route, forceOverwrite: true });
                    } else
                        await this.createRouter({ nameRoute, inputRouter: route });
                    break;
                case 'controller':
                    let controller = String(value).toLocaleLowerCase();
                    controller = controller.charAt(0).toUpperCase() + controller.slice(1);
                    let nameClass = this.addPrefix(indexSeparator, controller, 'Controller');
                    if (fs.existsSync(this.pathControllers + this.replaceAll(controller, '-') + `.${this.fileNameController}`)) {
                        console.log(ansiColors.redBright(`Controller '${value.toLocaleLowerCase()}' already exists`));
                        const answer = await confirm({ message: `Would you like to overwrite the ${value.toLocaleLowerCase()} controller?`, default: false });
                        if (answer)
                            await this.createController({ nameClass, inputController: value.toLocaleLowerCase(), forceOverwrite: true });
                    } else
                        await this.createController({ nameClass, inputController: value.toLocaleLowerCase() });
                    break;
                case 'r+c':
                    let routeController = String(value).toLocaleLowerCase();
                    const rcUpperCamelCase = routeController.charAt(0).toUpperCase() + routeController.slice(1);
                    nameClassController = this.addPrefix(indexSeparator, rcUpperCamelCase, 'Controller');

                    if (fs.existsSync(this.pathControllers + this.replaceAll(routeController, '-') + `.${this.fileNameController}`) && fs.existsSync(this.pathRoute + this.replaceAll(routeController, '-') + `.${this.fileNameRoutes}`)) {
                        console.log(ansiColors.redBright(`Controller and route '${value.toLocaleLowerCase()}' already exists`));
                        const answer = await confirm({ message: `Would you like to overwrite the controller and the route? '${ansiColors.blueBright(value.toLocaleLowerCase())}'`, default: false });
                        if (answer) {
                            await this.createRouter({ nameRoute, inputRouter: routeController, nameController: nameClassController, forceOverwrite: true });
                            await this.createController({ nameClass: nameClassController, inputController: routeController, forceOverwrite: true });
                        }
                    }
                    else if (fs.existsSync(this.pathControllers + this.replaceAll(routeController, '-') + `.${this.fileNameController}`)) {
                        console.log(ansiColors.redBright(`Controller '${value.toLocaleLowerCase()}' already exists`));
                        const answer = await confirm({ message: `Would you like to overwrite the '${ansiColors.blueBright(value.toLocaleLowerCase())}' controller?`, default: false });

                        if (answer) {
                            await this.createRouter({ nameRoute, inputRouter: routeController, nameController: nameClassController, forceOverwrite: true });
                            await this.createController({ nameClass: nameClassController, inputController: routeController });
                        }
                    }
                    else if (fs.existsSync(this.pathRoute + this.replaceAll(routeController, '-') + `.${this.fileNameRoutes}`)) {
                        console.log(ansiColors.redBright(`Route '${value.toLocaleLowerCase()}' already exists`));
                        const answer = await confirm({ message: `Would you like to overwrite the '${ansiColors.blueBright(value.toLocaleLowerCase())}' route? `, default: false });

                        if (answer) {
                            await this.createRouter({ nameRoute, inputRouter: routeController, nameController: nameClassController });
                            await this.createController({ nameClass: nameClassController, inputController: routeController, forceOverwrite: true });
                        }
                    } else {
                        await this.createRouter({ nameRoute, inputRouter: routeController, nameController: nameClassController, forceOverwrite: true });
                        await this.createController({ nameClass: nameClassController, inputController: routeController, forceOverwrite: true });
                    }
                    break;
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    //#endregion

    //#endregion
}
