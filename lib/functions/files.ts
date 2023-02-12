import fs from 'fs';
import path from 'path';

const moveFilesTemplate = async () => {
    fs.copyFileSync(path.join(path.resolve(), '/lib/templates/core/libs/security.txt'), path.join(path.resolve(__dirname), '../templates/core/libs/security.txt'));

    fs.copyFileSync(path.join(path.resolve(), '/lib/templates/core/controllers/controller-base.txt'), path.join(path.resolve(__dirname), '../templates/core/controllers/controller-base.txt'));

}

moveFilesTemplate();