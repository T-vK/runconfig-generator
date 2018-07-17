# Run Configuration Generator

## How to install
```
npm i -g runconfig-generator
```

## How to use
Add entries to the script section of your package.json. E.g.:
```
{
  "name": "example project",
  "main": "index.js",
  "scripts": {
    "unit-tests": "gulp mocha"
    "start": "node index.js"
  }
}
```

Go to your project folder and run `runconfig-generator`.

## How to specify environment variables
`runconfig-generator --env`  
Create a `.env` file in your project for variables that shall be used by ALL run configurations.
For variables that should only be used for a certain run script create a folder called `.env-files` in your project and name them after your run scripts with a .env extension.
For the package.json example above, you'd be using `.env-files/unit-tests.env` and `.env-files/start.env`.
.env files are optional and if you specify both a global one and a script-specific one, the variables of both files will be used.
Script-specific variables have a higher priority when duplicated variables are being specified.

## How it works
It parses your `package.json` script section and uses them to create npm run configurations under `.idea/runConfigurations` in your project, that WebStorm will automatically recognize.
