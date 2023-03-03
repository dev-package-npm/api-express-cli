import fs from 'fs';
import path from 'path';
const fileForWatch = [
    {
        file_name: 'security.txt',
        path_origin: path.join(path.resolve(), '/lib/class/templates/'),
        path_destination: path.join(path.resolve(__dirname), '../class/templates/'),
    },
    {
        file_name: 'controller-base.txt',
        path_origin: path.join(path.resolve(), '/lib/class/templates/'),
        path_destination: path.join(path.resolve(__dirname), '../class/templates/'),
    }
];

const moveFilesTemplate = async () => {
    for (const item of fileForWatch) {
        if (fs.existsSync(item.path_destination))
            fs.copyFileSync(item.path_origin + item.file_name, item.path_destination + item.file_name);
        else {
            fs.mkdirSync(item.path_destination, { recursive: true });
            fs.copyFileSync(item.path_origin + item.file_name, item.path_destination + item.file_name);
        }
    }
}

moveFilesTemplate();

export { moveFilesTemplate, fileForWatch }