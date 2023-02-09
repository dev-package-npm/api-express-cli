import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from '../../../config/structure-configuration.json';

export const pathControllerCore = path.resolve() + '/' + config1.dir + '/core/controllers/';

export const createControllerCore = () => {
    const contentBaseController = fs.readFileSync(path.resolve() + '/src/templates/core/controllers/controller-base.txt', 'utf-8')
    const fileName = config1.subDir.core.controllers[0]
    if (!fs.existsSync(pathControllerCore))
        fs.mkdirSync(pathControllerCore, { recursive: true });
    fs.writeFileSync(pathControllerCore + '/' + fileName, contentBaseController);
};