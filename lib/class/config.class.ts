import fs from 'fs';
import path from 'path';
import { config1 } from '../config/structure-configuration.json';
import { TStructureProject } from './interfaces/config.inteface';


export class Config {
    private readonly pathFileConfig: string = path.join(path.resolve(__dirname), '../config/structure-configuration.json');
    protected config = config1;

    protected structureProject: TStructureProject = {
        dir: 'src',
        subDir: {
            controllers: [],
            helpers: [
                'common-function.helper.ts',
                'file.helper.ts'
            ],
            core: {
                controllers: ['controller.ts'],
                libs: ['security.ts'],
                models: ['model.ts']
            },
            databases: {
                migrations: [],
                scripts: [],
                seeders: []
            },
            settings: {
                server: {
                    middlewares: ['middlewares.ts'],
                    files: [
                        'server.ts',
                        'ws-server.ts'
                    ]
                },
                files: [
                    'database.ts',
                    'multer.ts'
                ]
            },
            files: ['index.ts'],
            libs: [],
            models: [],
            routes: ['routes.ts'],
            testing: {
                controllers: [],
                models: [],
                routes: ['routes.ts']
            },

        }
    };

    getSubdirs() {
        return Object.keys(this.structureProject.subDir);
    }

}

export { config1 };