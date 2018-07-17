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

*Global variables*  
Create a `.env` file in your project for variables that shall be used by ALL run configurations.

*Script-specific variables*  
Create a folder called `.env-files` in your project for variables that should only be used for a certain run script.
In this folder create files named after your run scripts with a .env extension.
For the package.json example above, you could create `.env-files/unit-tests.env` and `.env-files/start.env`.

`.env` files are optional and will only be taken into consideration when the `--env`-flag is being passed.  
If you specify the same variable in the global .env and a script-specific.env one, the script-specific variable will be used.  

## How it works
This tool parses your `package.json`'s script section and uses the entries to create npm run configuration files under `.idea/runConfigurations` in your project so that WebStorm will automatically recognize them.
