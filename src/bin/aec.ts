#!/usr/bin/env node
import ansiColors from 'ansi-colors';
import { version } from '../../package.json';
import { controller } from '../cli/controller.cli';
import { entity } from '../cli/entity.cli';
import { startStructure } from '../cli';
import { model } from '../cli/model.cli';
import { route } from '../cli/route.cli';
import { addUtilities } from '../cli/add-utility';
import { dir } from '../config/structure-configuration.json';

import fs from 'fs';
import path from 'path';
import readLine from 'readline';
import { createRouteWs } from '../templates/websocket/route-ws';
import { createControllerWs } from '../templates/websocket/controller-ws';
import { createServerHttp } from '../templates/settings/server';
import { removeModules } from '../cli/remove-modules';
const main = async () => {
    try {
        process.title = "aec " + Array.from(process.argv).slice(2).join(" ");
        const input = process.title.split(" ");
        const params = input[1];

        if (params === "--help" || params === "-h" || params == "") {
            const help = `
Example command
    ${ansiColors.cyan('aec <command> --help ')}More information
    ${ansiColors.cyan('aec <flags> <options> ')}More information
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
    ${ansiColors.cyan('--add ')}Name module.
    `;
            console.log(help);
        }
        else if (params == 'init' || params == 'in') {
            await startStructure();
            interpretAttibutes(input);
        }
        else if (params == 'entity' || params == 'e') {
            if (fs.existsSync(path.resolve() + dir + '/models'))
                await entity();
            else console.log(ansiColors.yellowBright('You can\'t create an entity because you haven\'t added the database module. '), ansiColors.blueBright('Use aec add db:mysql'));
        }
        else if (params == 'route' || params == 'r') {
            await route();
        }
        else if (params == 'controller' || params == 'c') {
            await controller();
        }
        else if (params == 'model' || params == 'm') {
            if (fs.existsSync(path.resolve() + dir + '/models'))
                await model();
            else console.log(ansiColors.yellowBright('You can\'t create an entity because you haven\'t added the database module. '), ansiColors.blueBright('Use aec add db:mysql'));
        }
        else if (params == 'add' || params == 'ad') {
            await addUtilities(input.slice(2)[0]);
        }
        else if (params == 'remove' || params == 'rm') {
            await removeModules(input.slice(2));
        }
        else if (params == '-v' || params == '--version') {
            console.log('Version', ansiColors.cyan(version));
        }
        else console.log(ansiColors.yellowBright('Command is not valid'));
    } catch (error: any) {
        console.error(ansiColors.redBright(error.message));
    }
};

const interpretAttibutes = (input: Array<string>) => {
    if (input.length > 2) {
        var attributes;
        attributes = input.slice(2);
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
                console.log(ansiColors.redBright('Invalid attribute'));
                break;
        }
    }
}

main();
