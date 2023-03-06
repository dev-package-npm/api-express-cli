import fs from 'fs';
import path from 'path';
import { TStructureProject } from './interfaces/config.inteface';

export class Config {
    protected readonly folderBuild = 'dist';
    private readonly folderSource = 'src';

    protected readonly pathRoute = path.join(path.resolve(), '/', this.folderSource, '/routes/');
    protected readonly pathCoreController = path.join(path.resolve(), '/', this.folderSource, '/core/controllers/');
    protected readonly pathCoreModel = path.join(path.resolve(), '/', this.folderSource, '/core/models/');
    protected readonly pathModel = path.join(path.resolve(), '/', this.folderSource, '/models/')
    protected readonly pathCoreSecurity = path.join(path.resolve(), '/', this.folderSource, '/core/libs/');
    protected readonly pathMiddleware = path.join(path.resolve(), '/', this.folderSource, '/settings/server/middlewares/');
    protected readonly pathServer = path.join(path.resolve(''), '/', this.folderSource, '/settings/server/');
    protected readonly pathIndexApi = path.join(path.resolve(), '/', this.folderSource);
    protected readonly pathControllers = path.join(path.resolve(), '/', this.folderSource, '/controllers/');
    protected readonly pathSettings = path.join(path.resolve(), '/', this.folderSource, '/settings/');
    protected readonly pathTestingRoute = path.join(path.resolve(), '/', this.folderSource, '/testing/routes/');
    protected readonly pathTestingController = path.join(path.resolve(), '/', this.folderSource, '/testing/controllers/');

    protected arrayExtensionFile = ['ts', 'js'];
    protected ext = this.arrayExtensionFile[0];

    protected fileNameController = `controller.${this.ext}`;
    protected fileNameSecurity = `security.${this.ext}`;
    protected fileNameCommonFunctionHelper = `common-function.helper.${this.ext}`;
    protected fileNameFileHelper = `file.helper.${this.ext}`;
    protected fileNameModel = `model.${this.ext}`;
    protected fileNameMiddleware = `middleware.${this.ext}`;
    protected fileNameServer = `server.${this.ext}`;
    protected fileNameWsServer = `ws-server.${this.ext}`;
    protected fileNameDatabase = `database.${this.ext}`;
    protected fileNameMulter = `multer.${this.ext}`;
    protected fileNameIndex = `index.${this.ext}`;
    protected fileNameRoutes = `routes.${this.ext}`;


    protected structureProject: TStructureProject = {
        dir: this.folderSource,
        subDir: {
            controllers: [],
            helpers: [
                this.fileNameCommonFunctionHelper,
                this.fileNameFileHelper
            ],
            core: {
                controllers: [this.fileNameController],
                libs: [this.fileNameSecurity],
                models: [this.fileNameModel]
            },
            databases: {
                migrations: [],
                scripts: [],
                seeders: []
            },
            settings: {
                server: {
                    middlewares: [this.fileNameMiddleware],
                    files: {
                        path: this.pathServer,
                        server: this.fileNameServer,
                        ws_server: this.fileNameWsServer
                    }
                },
                files: {
                    path: this.pathSettings,
                    database: this.fileNameDatabase,
                    multer: this.fileNameMulter
                }
            },
            files: {
                index: this.fileNameIndex,
                path: this.folderSource
            },
            libs: [],
            models: [],
            routes: [this.fileNameRoutes],
            testing: {
                controllers: ['test.controller.ts'],
                models: ['test.model.ts'],
                routes: [this.fileNameRoutes]
            },
            services: {
                controllers: [],
                models: [],
                routes: [this.fileNameRoutes]
            }
        }
    };


    getSubdirs() {
        return Object.keys(this.structureProject.subDir);
    }
}
