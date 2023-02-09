import fs from 'fs';
import path from 'path';

export const createEnvFile = () => {
    const content = fs.readFileSync(path.resolve() + '/src/templates/env.txt', 'utf-8');

    fs.writeFileSync(path.resolve() + '/.env', content);
};