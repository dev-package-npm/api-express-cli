import fs from 'fs';
import path from 'path';
const fileForWatch = [
    {
        origin: path.join(path.resolve(), '/lib/templates/core/libs/security.txt'),
        destination: path.join(path.resolve(__dirname), '../templates/core/libs/security.txt')
    },
    {
        origin: path.join(path.resolve(), '/lib/templates/core/controllers/controller-base.txt'),
        destination: path.join(path.resolve(__dirname), '../templates/core/controllers/controller-base.txt')
    }
];

const moveFilesTemplate = async () => {
    for (const item of fileForWatch) {
        fs.copyFileSync(item.origin, item.destination);
    }
}

moveFilesTemplate();

export { moveFilesTemplate, fileForWatch }