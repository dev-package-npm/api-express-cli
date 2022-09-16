import { createFile } from "ts-code-generator";

export const routeIndex = (options: number) => {
    return createFile({
        fileName: 'routes.ts',
        imports: [
            {
                moduleSpecifier: 'express',
                namedImports: [{ name: ' Router ' }],
                onAfterWrite: writer => {
                    writer.blankLine();
                    writer.writeLine('//#region rutes');
                    if (options == 0) {
                        writer.writeLine('import testRouter from "../testing/routes/routes";');
                        writer.writeLine('// Example');
                        writer.writeLine('//import userRouter from "./user.route"');
                    }
                    else {
                        writer.writeLine('// Example');
                        if (options == 1)
                            writer.writeLine('//import testUserRouter from "../testing/controllers/user.test.controller"";');
                        else if (options == 2)
                            writer.writeLine('//import authRouter from "../auth/routes/routes";');
                    }
                    writer.writeLine('//#endregion');
                }
            }
        ],
        variables: [
            {
                name: options == 0 ? 'router' : options == 1 ? 'testRouter' : 'servicesRouter',
                defaultExpression: 'Router()',
                declarationType: 'const',
                onAfterWrite: writer => {
                    writer.blankLine();
                    if (options == 0) {
                        writer.writeLine('//#region Definition of routes for the api');
                        writer.writeLine('// Testing');
                        writer.writeLine('router.use(\'testing\', testRouter);');
                        writer.writeLine('// End points for entities');
                        writer.writeLine('// Example');
                        writer.writeLine('//router.use(\'users\', userRouter);');
                    }
                    else if (options == 1) {
                        writer.writeLine('//#region  Definition of routes for tests');
                        writer.writeLine('//Example');
                        writer.writeLine('//router.use(\'users\', testUserRouter);');
                    }
                    else if (options == 2) {
                        writer.writeLine('//#region  Definition of routes for services');
                        writer.writeLine('// Example');
                        writer.writeLine('//router.use(\'auth\', authRouter);');
                    }
                    writer.writeLine('//#endregion');
                }
            }
        ],
        defaultExportExpression: options == 0 ? 'router' : options == 1 ? 'testRouter' : 'servicesRouter'
    })
};