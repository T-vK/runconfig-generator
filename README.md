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
    "unit-tests": "mocha ./test"
    "start": "node index.js"
  }
}
```

Go to your project folder and run `runconfig-generator`.

## How to specify environment variables

**Global variables**  
Create a `.env` file in your project for variables that shall be used by ALL run configurations.  

**Script-specific variables**  
Create a folder called `.env-files` in your project for variables that should only be used for a certain run script.  
In this folder create files named after your run scripts with a .env extension.  
For the package.json example above, you could create `.env-files/unit-tests.env` and `.env-files/start.env`.  

`.env` files are optional and will only be taken into consideration when using the below provided `dotenv`-code in your project (for npm run ...) or when the `--env`-flag is being passed (for WebStorm Run Configurations).  
If you specify the same variable in the global .env and a script-specific.env one, the script-specific variable will be used.  

If you want to load the environment variables when running the scripts using e.g. `npm run myscript` and not just using the WebStorm GUI, then add this to the very beginning of your projects source code:
```
const dotenv = require('dotenv')
if (process.env.npm_lifecycle_event) { // if run using npm
    dotenv.config({silent: true, path: `./.env-files/${process.env.npm_lifecycle_event}.env`}) // load script specific env vars from .env-files folder
    dotenv.config({silent: true}) // load global env vars from .env file
}
```

If you want to load the environment variables when running the scripts using the Run Configuration GUI in WebStorm, you can have to pass the `--env` flag:  
`runconfig-generator --env`  
This will embed the env vars in the Run Configurations.

## Clean Run Configurations before generating new ones
If you want to delete all old Run Configurations before generating the new ones you can pass the `--clean` flag.  
Note: If a Run Configuration is generated it will always automatically overwrite the old one if the old one was also generated (no matter if `--clean has been set`).

## How it works
This tool parses your `package.json`'s script section and uses the entries to create npm (or mocha if the script begins with a mocha command) run configuration files under `.idea/runConfigurations` in your project so that WebStorm will automatically recognize them. 
