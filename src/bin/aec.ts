#!/usr/bin/env node
import ansiColors from 'ansi-colors';
import { version } from '../../package.json';
import { controller } from '../cli/controller.cli';
import { entity } from '../cli/entity.cli';
import { startStructure } from '../cli';
import { model } from '../cli/model.cli';
import { route } from '../cli/route.cli';
import { addUtilities } from '../cli/add-utility';

import fs from 'fs';
import path from 'path';
import readLine from 'readline';
import { createRouteWs } from '../templates/websocket/route-ws';
import { createControllerWs } from '../templates/websocket/controller-ws';
import { createServerHttp } from '../templates/settings/server';
const main = async () => {
    try {
        process.title = "aec " + Array.from(process.argv).slice(2).join(" ");

        const params = process.title.split(" ")[1];
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
    ${ansiColors.cyan('--help, -h ')}Print this message.
    ${ansiColors.cyan('--version, -v ')}Print version with package.

COMMAND OPTIONS
    ${ansiColors.cyan('--name ')}Name files.
    `;
            console.log(help);
        }
        else if (params == 'init' || params == 'in') {
            startStructure();
        }
        else if (params == 'entity' || params == 'e') {
            await entity();
        }
        else if (params == 'route' || params == 'r') {
            await route();
        }
        else if (params == 'controller' || params == 'c') {
            await controller();
        }
        else if (params == 'model' || params == 'm') {
            await model();
        }
        else if (params == 'add' || params == 'ad') {
            await addUtilities(params);
        }
        else if (params == '-v' || params == '--version') {
            console.log('Version', ansiColors.cyan(version));
        }
        else console.log("command is not valid");
    } catch (error: any) {
        console.error(ansiColors.redBright(error.message));
    }
};

main();