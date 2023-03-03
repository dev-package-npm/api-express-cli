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
            [T in keyof Pick<TFolder, 'middlewares' | 'files'>]?: Array<string>
        }
    } | {
        [T in keyof Pick<TFolder, 'files'>]?: Array<string>
    };
    routes: Array<string>;
    middlewares: any;
    server: any;
    testing: {
        [T in keyof Pick<TFolderSubdir, 'controllers' | 'routes' | 'models'>]: Array<string>
    };
    src: any;
    files: Array<string>
}

type TFolderSubdir = Omit<TFolder, 'server' | 'middlewares' | 'src'>;

export { TStructureProject };

