import fs from 'fs';
import path from 'path';

export const createEnvFile = () => {
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
KEY='27KUqw*i"8v^IKs1xuXiqw*i"8v^IKs^IKs1xuXiqw*i"8v'`;

    fs.writeFileSync(path.resolve() + '/.env', content);
};