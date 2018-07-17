#!/usr/bin/env node
const fs = require('fs-extra')
const dotenv = require('dotenv')

const PACKAGE = require('./package.json')
const MAIN_ENV_FILE = './.env'
const ENV_FILE_DIR = './.env-files'
const RUN_CONFIGS_DIR = './.idea/runConfigurations'

let env = {}

fs.readFile(MAIN_ENV_FILE).then(fileContent=>{
    env = { ...env, ...dotenv.parse(fileContent)}
}).catch(err=>{
    // console.log(err)
}).finally(()=>{
    Object.keys(PACKAGE.scripts).forEach(scriptName => {
        let promise = fs.readFile(`${ENV_FILE_DIR}/${scriptName}.env`).then(fileContent=>{
            env = { ...env, ...dotenv.parse(fileContent)}
        }).catch(err=>{
            // console.log(err)
        }).finally(()=>{
            const runConfig = generateRunconfig(scriptName, scriptName, process.execPath, (process.argv.length > 2 && process.argv[2] == "--env") ? env : {})
            const runConfigPath = `${RUN_CONFIGS_DIR}/generated_${scriptName}.xml`
            fs.ensureFile(runConfigPath).then(()=>{
                return fs.writeFile(runConfigPath, runConfig)
            }).then(()=>{
                // console.log("runconfig created")
            }).catch(console.error)
        })
    })
})


function generateRunconfig(name, scriptName, nodePath="node", env={}, singleton=true, packagejsonPath="$PROJECT_DIR$/package.json") {
return `
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="${name}" type="js.build_tools.npm" factoryName="npm" singleton="${singleton}">
    <package-json value="${packagejsonPath}" />
    <command value="run" />
    <scripts>
      <script value="${scriptName}" />
    </scripts>
    <node-interpreter value="${nodePath}" />
    <envs>
${ Object.keys(env).map((k=>'      <env name="' + k + '" value="' + env[k] + '" />')).join('\n') }
    </envs>
    <method />
  </configuration>
</component>`
}
