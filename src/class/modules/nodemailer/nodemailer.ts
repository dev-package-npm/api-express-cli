import path from 'node:path';
import fs from 'node:fs';
import promises from 'node:fs/promises';
import ansiColors from 'ansi-colors';
import { Mixin } from 'ts-mixer';
import { Env } from '../../env.class';
import { Config } from '../../config.class';

export class Nodemailer extends Mixin(Config, Env) {
    private commonMessage: string = 'for email smtp module';

    protected async initDatabase(answer: string) {
        try {
            const pathDatabase = path.join(this.pathServer, this.fileNameConfigDatabase);
            if (!fs.existsSync(pathDatabase)) {
                this.spinnies.add('spinner-1', { text: ansiColors.blueBright(`Installing packages ${this.commonMessage}`) });
                await this.executeTerminal('npm i promise-mysql');
                this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright(`Done installation ${this.commonMessage}`) });
                fs.mkdirSync(this.pathCoreModel, { recursive: true });
                fs.mkdirSync(this.pathModel, { recursive: true });

            } else throw new Error(ansiColors.yellowBright(`A module \'${answer}\' has already been initialized`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected async removeDatabase(answer: string) {
        try {
            const pathDatabase = path.join(this.pathSettings, this.fileNameConfigDatabase);
            if (fs.existsSync(pathDatabase) && fs.readdirSync(this.pathModel).length == 0) {
                if (fs.existsSync(pathDatabase)) {
                    this.spinnies.add('spinner-1', { text: ansiColors.blueBright(`Uninstalling packages for the myslq database module}`) });
                    await this.executeTerminal('npm r promise-mysql');
                    this.spinnies.succeed('spinner-1', { text: ansiColors.greenBright('Finished uninstall for the module from database msyql') });
                    if (fs.existsSync(pathDatabase)) await promises.unlink(pathDatabase);

                    if (fs.existsSync(this.pathCoreModel + this.fileNameModel)) {
                        fs.rmSync(this.pathCoreModel + this.fileNameModel, { recursive: true });
                        if (fs.readdirSync(this.pathModel).length == 0)
                            fs.rmdirSync(this.pathModel);
                        if (fs.readdirSync(this.pathCoreModel).length == 0)
                            fs.rmdirSync(this.pathCoreModel);
                        await this.removeLineEnv();
                    };
                } else throw new Error(ansiColors.yellowBright(`The \'${answer} (mysql)\' module is not added`));
            }
            else if (!fs.existsSync(this.pathModel) && !fs.existsSync(pathDatabase))
                throw new Error(ansiColors.yellowBright(`The '${answer}' module is not added`))
            else
                throw new Error(ansiColors.yellowBright(`Could not delete module, because there are model files.${ansiColors.blueBright(' (Delete manually)')}`));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    protected isExistModuleDatabase(): boolean {
        return fs.existsSync(path.join(this.pathSettings, this.fileNameConfigDatabase)) && fs.existsSync(this.pathCoreModel + this.fileNameModel);
    }

}