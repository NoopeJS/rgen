#!/usr/bin/env node
import{program}from"commander";import fs from"fs-extra";import path from"path";import colors from"colors";import ora from"ora";import{fileURLToPath}from"url";import{getViteDevPort,getVitePreviewPort,minifyReactChunks,promptUser,runInDir}from"./utils/index.js";const __dirname=path.dirname(fileURLToPath(import.meta.url)),INewTypes={APP:"app",MODULE:"module",MODULE_COMPONENT:"moduleComponent",SERVICE:"service"};function isTypeValid(o){return Object.values(INewTypes).includes(o)}function isNameValid(o){return o.length>0}program.command("new <type> <name>").description("Generate a new unit - accepts [app, module, moduleComponent, service]").action((async(o,e)=>{const r=ora(),n=ora();try{if(!isTypeValid(o))throw new Error(`Type ${o} is not supported`);if(!isNameValid(e))throw new Error(`Name ${e} is not valid`);r.start(colors.cyan(`Generating ${o} ${e}...`));const s=path.join(__dirname,"templates",o),c=o===INewTypes.APP?path.join(process.cwd(),e):path.join(process.cwd(),"src",e);if((o===INewTypes.SERVICE||o===INewTypes.MODULE||o===INewTypes.MODULE_COMPONENT)&&fs.existsSync(path.join(process.cwd(),"src",e))&&"y"!==(await promptUser(`${o} for ${e} already exists, override? ${colors.cyan("[y/n]")} `)).toLowerCase())return void console.log(colors.red("\nAborting..."));await fs.copy(s,c);const i=path.join(c,"index.html"),t=(await fs.readFile(i,"utf-8")).replace(/\$1/g,e);await fs.writeFile(i,t);const a=path.join(c,"package.json"),l=await fs.readJson(a);l.name=e;const p=JSON.stringify(l,null,2);await fs.writeFile(a,p),r.succeed(colors.green(`Your ${o} ${e} has been generated successfully.`)),n.start(colors.cyan(`Installing dependencies for ${e}...`)),await runInDir("npm install",c),n.succeed(colors.green("Dependencies installed!")),console.log("\n"),console.log(colors.yellow("\nRun: "),`\ncd ${e}\nnpm run dev`),process.exit(0)}catch(o){n.isSpinning&&n.fail(colors.red("An error occurred while installing dependencies.")),r.isSpinning&&r.fail(colors.red("Generation process interrupted.")),console.log(colors.red(o.message)),o.cmd&&console.log(colors.yellow(`Try running ${colors.cyan(o.cmd)} manually to trace the error.`))}})),program.command("dev").description("Runs the application in development mode").action((async()=>{const o=ora();try{o.start(colors.cyan("Running development server..."));const e=process.cwd(),r=`http://localhost:${await getViteDevPort()}`;runInDir("vite --config vite.config.js",e),console.log("\n"),o.succeed(colors.green("Running: ")+colors.cyan(`${r}...`))}catch(e){o.isSpinning&&o.fail(colors.red("Failed to run development server.")),console.log(colors.red(e.message)),e.cmd&&console.log(colors.yellow(`Try running ${colors.cyan(e.cmd)} manually to trace the error.`))}})),program.command("build").description("Builds the application for production").action((async()=>{const o=ora();try{o.start(colors.cyan("Building application..."));const e=process.cwd();await runInDir("vite build --config vite.config.js",e),await minifyReactChunks(`${e}/dist/assets`,`${e}/dist/assets`),o.succeed(colors.green("Application built successfully.")),console.log("\n"),console.log(colors.yellow("Preview: ")+"rgen serve")}catch(e){o.isSpinning&&o.fail(colors.red("Failed to build application.")),console.log(colors.red(e.message)),e.cmd&&console.log(colors.yellow(`Try running ${colors.cyan(e.cmd)} manually to trace the error.`))}})),program.command("serve").description("Serves the application in production mode").action((async()=>{const o=ora();try{o.start(colors.cyan("Runninf preview server..."));const e=process.cwd(),r=`http://localhost:${await getVitePreviewPort()}`;runInDir("vite preview --config vite.config.js",e),console.log("\n"),o.succeed(colors.green("Running: ")+colors.cyan(`${r}...`))}catch(e){o.isSpinning&&o.fail(colors.red("Failed to run preview server.")),console.log(colors.red(e.message)),e.cmd&&console.log(colors.yellow(`Try running ${colors.cyan(e.cmd)} manually to trace the error.`))}})),program.parse(process.argv);