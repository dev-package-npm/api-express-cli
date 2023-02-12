import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export const createEnvFile = () => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(Date(), salt);
    const content = `# system environments
NODE_ENV=development
# NODE_ENV=production
PORT=3000
HOSTNAME_APP_DEVELOPMENT=localhost:\${PORT}
HOSTNAME_APP_PRODUCTION=example.bsacademy.com

# DB config
#HOST_DB_DEVELOPMENT=127.0.0.1
#USER_DB_DEVELOPMENT=root
#USER_PASSWORD_DEVELOPMENT=
#DB_NAME_DEVELOPMENT=db_test

#HOST_DB_PRODUCTION=127.0.0.1
#USER_DB_PRODUCTION=user_test
#USER_PASSWORD_PRODUCTION=12345
#DB_NAME_PRODUCTION=db_test

#Change key for each project
KEY='${hash}'`;

    fs.writeFileSync(path.resolve() + '/.env', content);
};