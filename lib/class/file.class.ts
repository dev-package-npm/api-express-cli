import { createFile, FileStructure } from "ts-code-generator";
import fs from 'fs';

export class FileControl {
    protected pathFile: string = '';
    config3 = 'hjkh';


    protected createFile(structure: FileStructure) {
        let file = createFile(structure);

        fs.writeFileSync(this.pathFile, file.write());
    }
}