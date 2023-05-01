import { createFile, FileStructure } from "ts-code-generator";
import fs from 'fs';
import bcrypt from 'bcryptjs';
import path from 'path';
import { Env } from "./env.class";


export class FileControl extends Env {
    protected pathFile: string = '';

    protected createFile(structure: FileStructure) {
        let file = createFile(structure);

        fs.writeFileSync(this.pathFile, file.write());
    }
}