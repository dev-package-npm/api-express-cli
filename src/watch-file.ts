import fs from 'node:fs';
import { fileForWatch, moveFilesTemplate } from './functions/files';

const watchFile = () => {
    for (const item of fileForWatch) {
        fs.watchFile(item.origin, (envent, filename) => {
            console.log(envent, filename);
            if (filename.size != envent.size) {
                moveFilesTemplate();
            }
        });
    }
}
watchFile();