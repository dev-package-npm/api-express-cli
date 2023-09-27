import path from 'node:path';
import fs from 'node:fs';
import promises from 'node:fs/promises';
import { createFile } from "ts-code-generator";
import ansiColors from 'ansi-colors';
import { Mixin } from 'ts-mixer';
import { Env } from '../../env.class';
import { Config } from '../../config.class';

export class Database extends Mixin(Config, Env) {
    private packages: string[] = ['cuby-orm'];

    protected async initDatabase(answer: string) {
        try {
            const pathDatabase = path.join(this.pathServer, this.fileNameConfigDatabase);
            if (!fs.existsSync(pathDatabase)) {
                this.spinnies.add('spinner-1', { text: ansiColors.blueBright('Installing packages for database module') });
                await this.executeTerminal('npm i ' + this.packages);
                this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Done installation for database module') });
                fs.mkdirSync(this.pathModel, { recursive: true });
                // TODO Hacer que funcione por la cofiguración que tiene internamente cuby-orm
                fs.mkdirSync('src/database/seeds', { recursive: true });
                fs.mkdirSync('src/database/migrations', { recursive: true });

                await this.createConfigDb();
            } else throw new Error(ansiColors.yellowBright(`A module \'${answer}\' has already been initialized`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async removeDatabase(answer: string) {
        try {
            const pathConfigDatabase = path.join(this.pathSettings, this.fileNameConfigDatabase);
            const pathModelLength = fs.existsSync(this.pathModel) ? fs.readdirSync(this.pathModel).length : 0;
            if (fs.existsSync(pathConfigDatabase) && pathModelLength == 0) {
                if (fs.existsSync(pathConfigDatabase)) {
                    this.spinnies.add('spinner-1', { text: ansiColors.blueBright(`Uninstalling packages for the database module`) });
                    await this.executeTerminal('npm r ' + this.packages);
                    this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Finished uninstall for the module from database ') });
                    if (fs.existsSync(this.pathModel))
                        fs.rmdirSync(this.pathModel);
                    if (fs.existsSync(pathConfigDatabase)) {
                        await promises.unlink(pathConfigDatabase);
                    }

                } else throw new Error(ansiColors.yellowBright(`The \'${answer} (cuby-orm)\' module is not added`));
            }
            else if (!fs.existsSync(this.pathModel) && !fs.existsSync(pathConfigDatabase))
                throw new Error(ansiColors.yellowBright(`The '${answer}' module is not added`))
            else
                throw new Error(ansiColors.yellowBright(`Could not delete module, because there are model files.${ansiColors.blueBright(' (Delete manually)')}`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async createConfigDb() {
        try {
            const file = createFile({
                fileName: this.fileNameConfigDatabase,
                imports: [
                    {
                        moduleSpecifier: 'cuby-orm',
                        namedImports: [
                            {
                                name: ' TConfigCuby ',
                            }
                        ]
                    }
                ],
                variables: [
                    {
                        name: 'configDatabase: TConfigCuby',
                        declarationType: 'const',
                        type: 'TconfigCuby',
                        isExported: true,
                        defaultExpression: `{
    type: 'mysql',
    connection: {
        connectionLimit: 103,
        host: 'localhost',
        user: 'root',
        password: '',
        database: '',
        charset: 'utf8mb4'
    }
}`
                    }
                ]
            });

            fs.writeFileSync(path.join(this.pathSettings, this.fileNameConfigDatabase), file.write());
            await this.addLineEnv();
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected isExistModuleDatabase(): boolean {
        return fs.existsSync(path.join(this.pathSettings, this.fileNameConfigDatabase));
    }

}