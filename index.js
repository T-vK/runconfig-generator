#!/usr/bin/env node
const fs = require('fs-extra')
const dotenv = require('dotenv')

const PACKAGE = require(`${process.cwd()}/package.json`)
const MAIN_ENV_FILE = `${process.cwd()}/.env`
const ENV_FILE_DIR = `${process.cwd()}/.env-files`
const RUN_CONFIGS_DIR = `${process.cwd()}/.idea/runConfigurations`

let env = {}

let initPromise = process.argv.includes("--clean") ? fs.emptyDir(RUN_CONFIGS_DIR) : Promise.resolve()

initPromise.then(()=>{
    if (process.argv.includes("--clean"))
        console.log("Old Run Configurations have been removed.")
    return fs.readFile(MAIN_ENV_FILE)
}).then(fileContent=>{
    env = { ...env, ...dotenv.parse(fileContent)}
}).catch(err=>{
    // console.log(err)
}).finally(()=>{
    let promiseArr = []
    Object.keys(PACKAGE.scripts).forEach(scriptName => {
        let promise = fs.readFile(`${ENV_FILE_DIR}/${scriptName}.env`).then(fileContent=>{
            env = { ...env, ...dotenv.parse(fileContent)}
        }).catch(err=>{
            // console.log(err)
        }).finally(()=>{
            const script = PACKAGE.scripts[scriptName]
            const scriptSplit = script.split(' ')
            const cmd = scriptSplit[0]
            let runConfig
            if (cmd === 'node') {
                runConfig = {
                    name: scriptName,
                    type: 'node',
                    env: (process.argv.includes("--env")) ? env : {},
                    params: scriptSplit.length > 1 ? scriptSplit.slice(1).join(' ') : ''
                }
            } else if (cmd === 'mocha') {
                runConfig = {
                    name: scriptName,
                    type: 'mocha',
                    nodeBin: process.execPath,
                    env: (process.argv.includes("--env")) ? env : {},
                    testDir: scriptSplit.length > 1 ? scriptSplit[1] : './',
                    args: scriptSplit.length > 2 ? scriptSplit.slice(2).join(' ') : ''
                }
            } else {
                runConfig = {
                    name: scriptName,
                    type: 'npm',
                    command: 'run',
                    script: scriptName,
                    nodeBin: process.execPath,
                    env: (process.argv.includes("--env")) ? env : {}
                }
            }
            const runConfigPath = `${RUN_CONFIGS_DIR}/generated_${scriptName}.xml`
            return fs.ensureFile(runConfigPath).then(()=>{
                return fs.writeFile(runConfigPath, generateRunConfig(runConfig))
            }).then(()=>{
                console.log(`Generated "${runConfig.type}" Run Configuration for "${runConfig.name}".`)
            }).catch(console.error)
        })
        promiseArr.push(promise)
    })
    Promise.all(promiseArr).then(()=>{
        console.log("Warning: A WebStorm restart might be required!")
    })
})


function generateRunConfig(cfg) {
    //type, name, scriptName, nodePath="node", env={}, singleton=true, packagejsonPath="$PROJECT_DIR$/package.json"
if (cfg.type === 'node') {
return `
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="${cfg.name}" type="NodeJSConfigurationType" factoryName="Node.js" node-parameters="${cfg.params}" working-dir="$PROJECT_DIR$">
    <envs>
${ Object.keys(cfg.env).map((k=>'      <env name="' + k + '" value="' + cfg.env[k] + '" />')).join('\n') }
    </envs>
    <method v="2" />
  </configuration>
</component>`
} else if (cfg.type === 'npm' && cfg.command === 'run') {
return `
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="${cfg.name}" type="js.build_tools.npm" factoryName="npm" singleton="${cfg.singleton || 'true'}">
    <package-json value="$PROJECT_DIR$/${cfg.packageJson || 'package.json'}" />
    <command value="run" />
    <scripts>
      <script value="${cfg.script}" />
    </scripts>
    <node-interpreter value="${cfg.nodeBin || 'node'}" />
    <envs>
${ Object.keys(cfg.env).map((k=>'      <env name="' + k + '" value="' + cfg.env[k] + '" />')).join('\n') }
    </envs>
    <method />
  </configuration>
</component>`
} else if (cfg.type === 'mocha') {
return `
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="${cfg.name}" type="mocha-javascript-test-runner" factoryName="Mocha" singleton="${cfg.singleton || 'true'}">
    <node-interpreter>${cfg.nodeBin}</node-interpreter>
    <node-options />
    <working-directory>$PROJECT_DIR$</working-directory>
    <envs>
${ Object.keys(cfg.env).map((k=>'      <env name="' + k + '" value="' + cfg.env[k] + '" />')).join('\n') }
    </envs>
    <ui>${cfg.ui || 'bdd'}</ui>
    <extra-mocha-options>${cfg.args}<extra-mocha-options />
    <test-kind>DIRECTORY</test-kind>
    <test-directory>$PROJECT_DIR$/${cfg.testDir || './test'}</test-directory>
    <recursive>${cfg.reursive || 'true'}</recursive>
    <method />
  </configuration>
</component>`
}
}
