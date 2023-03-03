import fs from 'node:fs';
import { fileForWatch, moveFilesTemplate } from './functions/files';

const watchFile = () => {
    for (const item of fileForWatch) {
        fs.watchFile(item.path_origin + item.file_name, (envent, filename) => {
            if (filename.size != envent.size) {
                moveFilesTemplate();
            }
        });
    }
}
watchFile();