import fs from 'fs';
import path from 'path';

export const createEnvFile = () => {
    const content = `# system environments
NODE_ENV=development
PORT=3000
# DB config

#HOST_DB=localhost
#USER_DB=root
#USER_PASSWORD=
#DB_NAME=`;

    fs.writeFileSync(path.resolve() + '/.env', content);
};