# Express Cli - For API

## Documentation

### Stting up a project

Install `api-express-cli` in dev dependecies:

```bash
npm i -D api-express-cli
```

Initialize typscript:

```
npx tsc --init
```

> Uncomment `outDir `in the generated `tsconfig.json `file and put `./dist.`
>
> Also look for `target `and put `ES2022`.

Add the following scripts in package.json:

```json
"scirpts": {
"start":"node ./dist/index",
"watch-node": "nodemon ./dist/index",
"watch-ts": "npx tsc -w"
}
```

Initialize project:

```bash
npx aec init
```

> This will create a structure for the project focused on the MVC model,
> It has a basic http server to start working.
>
> The following image shows the structure created.
>
> ![1663281512795](image/README/1663281512795.png)

| Commands &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Value &nbsp; &nbsp; &nbsp; | Params &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; | Example &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; | Description                                                                                    |
| :--------------------------------------------------------------- | :------------------------: | :--------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `npx aec init`                                                   |          `--add`           |                                    `db:mysq` or `ws`                                     | `npx aec init --add db:mysql` or `npx aec init ws`                                                                                                                                                                                               | Add new utilities when the value of `--add` is passed. You can put as many as there are        |
| `npx aec route`                                                  |                            |                                                                                          | `npx aec route` or `npx aec r `                                                                                                                                                                                                                  | Create a route with the given name                                                             |
| `npx aec controller `                                            |                            |                                                                                          | `npx aec controller ` or `npx aec c `                                                                                                                                                                                                            | Create a controller with the given name                                                        |
| `npx aec model`                                                  |                            |                                                                                          | `npx aec model ` or `npx aec m `                                                                                                                                                                                                                 | Create a model with the given name, as long as a database is configured                        |
| `npx aec entity`                                                 |                            |                                                                                          | `npx aec entity ` or `npx aec e `                                                                                                                                                                                                                | Create an entity with the given name: (controller, route, model)                               |
| `npx aec remove`                                                 |                            |                                    `db:mysq` or `ws `                                    | `npx aec remove db:mysql` or `npx aec rm db:mysql`                                                                                                                                                                                               | Removes one of the utilities that is added. At the moment you can only delete database utility |
| `npx aec --help`                                                 |                            |                                                                                          | `npx aec -h` or `npx aec`                                                                                                                                                                                                                        | Show command help                                                                              |

**Nota:** you can use `aec` or `api-express-cli`.

## Quick start

> After initializing the project, to verify that everything went well, you have to execute the following commands:
>
> - Transpile code from ts to js.
>   > `npm run watch-ts`
> - Start server.
>   > `npm run watch-node`

> You can then see if it is operating correctly by putting this `http://localhost:3000` in your browser.
