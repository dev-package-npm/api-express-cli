import fs from 'fs';
import path from 'path';
import { TStructureProject } from './interfaces/config.inteface';

export class Config {
    protected readonly folderBuild = 'dist';
    private readonly folderSource = 'src';
    protected pathResolve = path.resolve();

    protected pathRoute = path.join(this.pathResolve, '/', this.folderSource, '/routes/');
    protected pathCoreController = path.join(this.pathResolve, '/', this.folderSource, '/core/controllers/');
    protected pathCoreModel = path.join(this.pathResolve, '/', this.folderSource, '/core/models/');
    protected pathModel = path.join(this.pathResolve, '/', this.folderSource, '/models/')
    protected pathCoreSecurity = path.join(this.pathResolve, '/', this.folderSource, '/core/libs/');
    protected pathMiddleware = path.join(this.pathResolve, '/', this.folderSource, '/settings/server/middlewares/');
    protected pathServer = path.join(path.resolve(''), '/', this.folderSource, '/settings/server/');
    protected pathIndexApi = path.join(this.pathResolve, '/', this.folderSource);
    protected pathControllers = path.join(this.pathResolve, '/', this.folderSource, '/controllers/');
    protected pathSettings = path.join(this.pathResolve, '/', this.folderSource, '/settings/');
    protected pathTestingRoute = path.join(this.pathResolve, '/', this.folderSource, '/testing/routes/');
    protected pathTestingController = path.join(this.pathResolve, '/', this.folderSource, '/testing/controllers/');

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
    protected fileNameConfigDatabase = `cuby.config.${this.ext}`;
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
                    database: this.fileNameConfigDatabase,
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
    // TODO: Pendiente por borrar
    async setPath() {
        this.pathResolve = process.cwd();
        this.pathRoute = path.join(this.pathResolve, '/', this.folderSource, '/routes/');
        this.pathCoreController = path.join(this.pathResolve, '/', this.folderSource, '/core/controllers/');
        this.pathCoreModel = path.join(this.pathResolve, '/', this.folderSource, '/core/models/');
        this.pathModel = path.join(this.pathResolve, '/', this.folderSource, '/models/')
        this.pathCoreSecurity = path.join(this.pathResolve, '/', this.folderSource, '/core/libs/');
        this.pathMiddleware = path.join(this.pathResolve, '/', this.folderSource, '/settings/server/middlewares/');
        this.pathServer = path.join(path.resolve(''), '/', this.folderSource, '/settings/server/');
        this.pathIndexApi = path.join(this.pathResolve, '/', this.folderSource);
        this.pathControllers = path.join(this.pathResolve, '/', this.folderSource, '/controllers/');
        this.pathSettings = path.join(this.pathResolve, '/', this.folderSource, '/settings/');
        this.pathTestingRoute = path.join(this.pathResolve, '/', this.folderSource, '/testing/routes/');
        this.pathTestingController = path.join(this.pathResolve, '/', this.folderSource, '/testing/controllers/');
    }
}
