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

Install all types of dependency packagesInstall all types:

```
npm i -D @types/morgan @types/express @types/node
```

Add the following scripts in package.json:

```json
"scirpts": {
"start":"node ./dist/index",
"watch-ts": "npx tsc -w"
}
```

Initialize project:

> This will create a structure for the project focused on the MVC model,
> It has a basic http server to start working.

```bash
npx aec init
```

Create a route:

```bash
npx aec route
```

Create a controller:

```bash
npx aec controller
```

Create a model:

```bash
npx aec model
```

Create a entity:

```
npx aec entity
```

See help:

```
npx aec --help
```
