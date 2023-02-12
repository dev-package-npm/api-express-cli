import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';
// Local
import { config1 } from '../../../config/structure-configuration.json';

export const pathSecurityCore = path.resolve() + '/' + config1.dir + '/core/libs/';

export const createSecurityCore = () => {
    const contentBaseController = fs.readFileSync(path.resolve() + '/src/templates/core/libs/security.txt', 'utf-8')
    const fileName = config1.subDir.core.libs[0]
    if (!fs.existsSync(pathSecurityCore))
        fs.mkdirSync(pathSecurityCore, { recursive: true });
    fs.writeFileSync(pathSecurityCore + '/' + fileName, contentBaseController);
};