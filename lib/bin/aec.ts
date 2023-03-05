#!/usr/bin/env node
import ansiColors from 'ansi-colors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import Spinnies from 'spinnies';

import { controller } from '../cli/controller.cli';
import { entity } from '../cli/entity.cli';
import { startStructure } from '../cli';
import { model } from '../cli/model.cli';
import { route } from '../cli/route.cli';
import { addUtilities } from '../cli/add-utility-modules';

import { removeModules } from '../cli/remove-modules.cli';
import { addLineFilePackage } from '../templates/package';
import { PackageFile } from '../class/package-file.class';
import { Entities } from '../class/entities.class';

const packageFile = new PackageFile();

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
    private paramsValid: string[] = [

    ];
    private folderBuild = 'dist';
    //#endregion

    constructor() {
        super();
        //? Takes the data entered by the terminal, and stores it
        process.title = `${Array.from(process.argv).slice(2).join(" ")}`;
        this.input = process.title.split(" ");
    }

    async interpreInput() {
        try {
            // console.log(this.input);
            const params = this.input[0];
            if (params === "--help" || params === "-h" || params == "") {
                if (this.validateQuantityArguments(this.input, 1))
                    this.printHelp();
            }
            else if (fs.existsSync(this.pathPackage)) {
                if (params == 'init' || params == 'in') {
                    await this.startStructure();
                    this.interpretAttibutes(this.input);
                }
                else if (params == 'entity' || params == 'e') {
                    // if (fs.existsSync(path.resolve() + '/' + config1.dir + '/models'))
                    //     await entity();
                    // else console.log(ansiColors.yellowBright('You can\'t create an entity because you haven\'t added the database module. '), ansiColors.blueBright('Use aec add db:mysql'));
                }
                else if (params == 'route' || params == 'r') {
                    await route();
                }
                else if (params == 'controller' || params == 'c') {
                    // await controller();
                }
                else if (params == 'model' || params == 'm') {
                    // if (fs.existsSync(path.resolve() + '/' + config1.dir + '/models'))
                    //     await model();
                    // else console.log(ansiColors.yellowBright('You can\'t create an entity because you haven\'t added the database module. '), ansiColors.blueBright('Use aec add db:mysql'));
                }
                else if (params == 'add' || params == 'ad') {
                    // await addUtilities(input.slice(2)[0]);
                }
                else if (params == 'remove' || params == 'rm') {
                    // await removeModules(input.slice(2));
                }
                else console.log(ansiColors.yellowBright('Command is not valid'));
            }
            else if (params == 'create' || params == 'c') {
                console.log(this.input);
            }
            else if (params == '-v' || params == '--version') {
                if (this.validateQuantityArguments(this.input, 1))
                    console.log('Version', ansiColors.cyan(await packageFile.getVersion()));
            }
            else console.log(ansiColors.yellowBright('Command is not valid'));
        } catch (error: any) {
            console.error(ansiColors.redBright(error.message));
        }
    }

    //#region Private methods
    private printHelp() {
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

    private async startStructure() {
        const promise = new Promise(async (resolve, rejects) => {
            const spinnies = new Spinnies();
            try {
                const pathWork = path.resolve() + '/' + this.structureProject.dir;
                // ! quitar
                // if (fs.existsSync(pathWork))
                //     fs.rmSync(pathWork, { recursive: true });
                if (!fs.existsSync(pathWork)) {
                    const devPackages = '@types/morgan @types/express @types/node @types/bcryptjs @types/cryptr @types/jsonwebtoken nodemon typescript';
                    const _package = 'express morgan dotenv dotenv-expand bcryptjs cryptr jsonwebtoken';
                    spinnies.add('spinner-1', { text: ansiColors.blueBright('Installing packages...') });

                    await this.executeTerminal(`npm i ${_package}`);
                    await this.executeTerminal(`npm i ${devPackages} -D`);
                    spinnies.succeed('spinner-1', { text: ansiColors.blueBright('Done installation') });
                    const folders = this.getSubdirs().filter(value => value != 'models' && value != 'databases' && value != 'files');
                    folders.forEach((value) => {
                        fs.mkdirSync(pathWork + '/' + value, { recursive: true });
                    });
                    Object.keys(this.structureProject.subDir.testing).forEach((value) => {
                        fs.mkdirSync(pathWork + '/testing/' + value, { recursive: true });
                    });
                    if (fs.existsSync(pathWork + '/routes/'))
                        fs.writeFileSync(pathWork + '/routes/' + this.routeIndex(0).fileName, this.routeIndex(0).write());
                    if (fs.existsSync(pathWork + '/testing/routes/')) {
                        fs.writeFileSync(pathWork + '/testing/routes/' + this.routeIndex(1).fileName, this.routeIndex(1).write());
                    }
                    this.createEnvFile();
                    // Create core files
                    this.createControllerCore();
                    this.createSecurityCore();
                    // Create Server http
                    this.createMiddlewares();
                    await this.createServerHttp();
                    this.createIndexApi();
                    if (!fs.existsSync(path.resolve() + '/tsconfig.json')) {
                        await this.executeTerminal(`npx tsc --init --target ES2022 --removeComments true --outDir ./${this.folderBuild}`);
                        await this.addLineFilePackage(this.folderBuild);
                    }
                    resolve(true);
                }
                else {
                    rejects(new Error('A project has already been initialized'));
                }
            } catch (error: any) {
                spinnies.fail('spinner-1', { text: ansiColors.blueBright(error.message) });
                rejects(new Error(error.message));
            }
        });

        return await promise;
    };

    private executeTerminal(params: string): Promise<string> {
        return new Promise((resovle, rejects) => {
            exec(params, (error, stdout, stderr) => {
                if (error != null)
                    rejects(new Error(String(error)));
                if (stderr != '')
                    rejects(new Error(String(stderr)));
                resovle(stdout);
            });
        });
    }

    private interpretAttibutes(input: Array<string>) {
        if (input.length > 2) {
            var attributes = input.slice(2);
            switch (attributes[0]) {
                case '--add':
                    attributes = attributes.slice(1);
                    attributes.forEach(async element => {
                        await addUtilities(element);
                    });
                    break;
                case '--name':
                    break;
                default:
                    throw new Error('Invalid attribute');
                    break;
            }
        } else throw new Error('A value is expected in the argument');
    }
    //#endregion
}
