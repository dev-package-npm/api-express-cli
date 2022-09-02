import { createFile } from "ts-code-generator";
import fs from 'fs';
import path from 'path';

const pathIndexApi = path.resolve() + '/public/core/models/';

export const createModelCore = () => {
    const file = createFile({
        fileName: 'model.ts',

    });
};