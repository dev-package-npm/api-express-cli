import fs from 'fs';
import path from 'path';
const fileForWatch = [
    {
        origin: path.join(path.resolve(), '/lib/class/templates/security.txt'),
        destination: path.join(path.resolve(__dirname), '../templates/security.txt')
    },
    {
        origin: path.join(path.resolve(), '/lib/class/templates/controller-base.txt'),
        destination: path.join(path.resolve(__dirname), '../templates/controller-base.txt')
    }
];

const moveFilesTemplate = async () => {
    for (const item of fileForWatch) {
        fs.copyFileSync(item.origin, item.destination);
    }
}

moveFilesTemplate();

export { moveFilesTemplate, fileForWatch }