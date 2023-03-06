type TStructureProject = {
    dir: keyof Pick<TFolder, 'src'>,
    subDir: TFolderSubdir;
}

type TFolder = {
    controllers: any;
    core: {
        [T in keyof Pick<TFolderSubdir, 'controllers' | 'libs' | 'models'>]: Array<string>
    };
    libs: any;
    models: any;
    databases?: {
        [T in keyof Pick<TFolderSubdir, 'seeders' | 'scripts' | 'migrations'>]?: Array<string>
    };
    seeders?: any;
    scripts?: any;
    migrations?: any;
    helpers: Array<string>;
    services?: {
        [T in keyof Pick<TFolderSubdir, 'controllers' | 'routes' | 'models'>]: Array<string>
    };
    settings: {
        [T in keyof Pick<TFolder, 'server'>]: {
            [T in keyof Pick<TFolder, 'middlewares'>]: Array<string>

        } & {
            [T in keyof Pick<TFolder, 'files'>]: IFilesServer
        }
    } & {
        [T in keyof Pick<TFolder, 'files'>]: IFilesSettings
    };
    routes: Array<string>;
    middlewares: any;
    server: any;
    testing: {
        [T in keyof Pick<TFolderSubdir, 'controllers' | 'routes' | 'models'>]: Array<string>
    };
    src: any;
    files: TFiles;
}

type TFolderSubdir = Omit<TFolder, 'server' | 'middlewares' | 'src'>;

type TFiles = {
    path: string;

} & {
    [T: string]: string;
}

interface IFilesSettings extends TFiles {
    database: string;
    multer: string;
}

interface IFilesServer extends TFiles {
    server: string;
    ws_server: string;
}

export { TStructureProject };
