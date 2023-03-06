#!/usr/bin/env node
import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { camelCase, getAvailableTypes, getUnitName, getViteDevPort, getVitePreviewPort, kebabCase, minifyReactChunks, parseTemplateString, promptUser, runInDir } from './utils/index.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INewTypes = getAvailableTypes();
program
    .command('new <type> <name>')
    .description(`Generate a new unit - accepts [${Object.values(INewTypes).join(', ')}]`)
    .action(async (type, name) => {
    try {
        const validType = isTypeValid(type);
        if (!validType) {
            throw new Error(`Type ${type} is not supported`);
        }
        const validName = isNameValid(name, type);
        if (!validName) {
            throw new Error(`Name ${name} is not valid\nName must be at least 1 character long and units cannot start with "root"`);
        }
        // Define the source and destination directories
        const templateDir = getTypeTemplateDir(type);
        const projectDir = getTypeProjectDir(type, name);
        const generator = await getContext(type, name);
        if (!generator) {
            return;
        }
        await generator({ name, templateDir, projectDir });
    }
    catch (err) {
        console.log(colors.red(err.message));
        if (err.cmd) {
            console.log(colors.yellow(`Try running ${colors.cyan(err.cmd)} manually to trace the error.`));
        }
    }
});
program.command('dev')
    .description('Runs the application in development mode')
    .action(async () => {
    const devProcess = ora();
    try {
        devProcess.start(colors.cyan("Running development server..."));
        const projectDir = process.cwd();
        const port = await getViteDevPort();
        const url = `http://localhost:${port}`;
        runInDir(`vite --config vite.config.js`, projectDir);
        console.log("\n");
        devProcess.succeed(colors.green("Running: ") + colors.cyan(`${url}...`));
    }
    catch (err) {
        if (devProcess.isSpinning) {
            devProcess.fail(colors.red("Failed to run development server."));
        }
        console.log(colors.red(err.message));
        if (err.cmd) {
            console.log(colors.yellow(`Try running ${colors.cyan(err.cmd)} manually to trace the error.`));
        }
    }
});
program.command('build')
    .description('Builds the application for production')
    .action(async () => {
    const buildProcess = ora();
    try {
        buildProcess.start(colors.cyan("Building application..."));
        const projectDir = process.cwd();
        await runInDir(`vite build --config vite.config.js`, projectDir);
        await minifyReactChunks(`${projectDir}/dist/assets`, `${projectDir}/dist/assets`);
        buildProcess.succeed(colors.green("Application built successfully."));
        console.log("\n");
        console.log(colors.yellow("Preview: ") + "rgen serve");
    }
    catch (err) {
        if (buildProcess.isSpinning) {
            buildProcess.fail(colors.red("Failed to build application."));
        }
        console.log(colors.red(err.message));
        if (err.cmd) {
            console.log(colors.yellow(`Try running ${colors.cyan(err.cmd)} manually to trace the error.`));
        }
    }
});
program.command('serve')
    .description('Serves the application in production mode')
    .action(async () => {
    const serveProcess = ora();
    try {
        serveProcess.start(colors.cyan("Running preview server..."));
        const projectDir = process.cwd();
        const port = await getVitePreviewPort();
        const url = `http://localhost:${port}`;
        runInDir(`vite preview --config vite.config.js`, projectDir);
        console.log("\n");
        serveProcess.succeed(colors.green("Running: ") + colors.cyan(`${url}...`));
    }
    catch (err) {
        if (serveProcess.isSpinning) {
            serveProcess.fail(colors.red("Failed to run preview server."));
        }
        console.log(colors.red(err.message));
        if (err.cmd) {
            console.log(colors.yellow(`Try running ${colors.cyan(err.cmd)} manually to trace the error.`));
        }
    }
});
program.parse(process.argv);
function isTypeValid(type) {
    return Object.values(INewTypes).includes(type);
}
function isNameValid(name, type) {
    return name.length > 0 && !(camelCase(name).startsWith("root") && type !== INewTypes.APP);
}
function getTypeTemplateDir(type) {
    return path.join(__dirname, 'templates', type);
}
function getTypeProjectDir(type, name) {
    return type === INewTypes.APP
        ? path.join(process.cwd(), kebabCase(name))
        : path.join(process.cwd(), 'src', kebabCase(name));
}
async function getContext(type, name) {
    const map = {
        [INewTypes.APP]: generateNewApp,
        [INewTypes.MODULE]: generateNewModule,
        [INewTypes.MODULE_COMPONENT]: generateNewModuleComponent,
        [INewTypes.SERVICE]: generateNewService,
        [INewTypes.MODULE_CLASS]: generateNewModuleClass,
    };
    // Check if the directory already exists and prompt user if overwriting
    const existingDir = type === INewTypes.APP ?
        fs.existsSync(path.join(process.cwd(), kebabCase(name))) :
        type === INewTypes.MODULE ?
            fs.existsSync(path.join(process.cwd(), 'src', kebabCase(name))) :
            fs.existsSync(path.join(process.cwd(), 'src', kebabCase(name), getUnitName(name, type)));
    if (existingDir) {
        console.log("\n");
        const prompt = await promptUser(colors.yellow(`${type} for ${kebabCase(name)} already exists, override? ${colors.cyan('[y/n]')} `));
        if (prompt.toLowerCase().trim() !== 'y') {
            console.log(colors.red('\nAborting...'));
            return undefined;
        }
    }
    return map[type];
}
async function generateNewApp({ name, templateDir, projectDir }) {
    const generatingProcess = ora();
    const installingProcess = ora();
    try {
        generatingProcess.start(colors.cyan(`Generating app ${kebabCase(name)}...`));
        // Copy the template files to the project directory
        await fs.copy(templateDir, projectDir);
        // Update the index.html file
        const indexHtmlPath = path.join(projectDir, 'index.html');
        const indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
        const updatedIndexHtml = parseTemplateString(indexHtml, name);
        await fs.writeFile(indexHtmlPath, updatedIndexHtml);
        // Update the package.json file
        const packageJsonPath = path.join(projectDir, 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = kebabCase(name);
        const updatedPackageJson = JSON.stringify(packageJson, null, 2);
        await fs.writeFile(packageJsonPath, updatedPackageJson);
        generatingProcess.succeed(colors.green(`Your app ${kebabCase(name)} has been generated successfully.`));
        // Install dependencies
        installingProcess.start(colors.cyan(`Installing dependencies for ${kebabCase(name)}...`));
        await runInDir('npm install', projectDir);
        installingProcess.succeed(colors.green(`Dependencies installed!`));
        console.log("\n");
        console.log(colors.yellow("\nRun: "), `\ncd ${kebabCase(name)}\nnpm run dev`);
        process.exit(0);
    }
    catch (error) {
        if (installingProcess.isSpinning) {
            installingProcess.fail(colors.red("An error occurred while installing dependencies."));
        }
        if (generatingProcess.isSpinning) {
            generatingProcess.fail(colors.red("Generation process interrupted."));
        }
        throw error;
    }
}
async function generateNewModule({ name, templateDir, projectDir }) {
    const generatingProcess = ora();
    generatingProcess.start(colors.cyan(`Generating module ${camelCase(name)}...`));
    // Copy the template files to the project directory which are $kebabed.module.ts and $kebabed.style.css and $kebabed.component.tsx and $kebabed.service.ts
    try {
        const kebabedName = kebabCase(name);
        await fs.copy(templateDir, projectDir);
        // Rename the files to the name of the module and remove the $1 placeholder in the files
        const moduleTsPath = path.join(projectDir, '$kebabed.module.ts');
        const moduleCssPath = path.join(projectDir, '$kebabed.style.css');
        const moduleTsxPath = path.join(projectDir, '$kebabed.component.tsx');
        const moduleServicePath = path.join(projectDir, '$kebabed.service.ts');
        const updatedModuleTsPath = path.join(projectDir, `${kebabedName}.module.ts`);
        const updatedModuleCssPath = path.join(projectDir, `${kebabedName}.style.css`);
        const updatedModuleTsxPath = path.join(projectDir, `${kebabedName}.component.tsx`);
        const updatedModuleServicePath = path.join(projectDir, `${kebabedName}.service.ts`);
        await fs.rename(moduleTsPath, updatedModuleTsPath);
        await fs.rename(moduleCssPath, updatedModuleCssPath);
        await fs.rename(moduleTsxPath, updatedModuleTsxPath);
        await fs.rename(moduleServicePath, updatedModuleServicePath);
        // replace every $1 in the files with camelCasedName and $2 with capitalizedCamelCasedName
        const moduleTs = await fs.readFile(updatedModuleTsPath, 'utf-8');
        const styleCss = await fs.readFile(updatedModuleCssPath, 'utf-8');
        const componentTsx = await fs.readFile(updatedModuleTsxPath, 'utf-8');
        const serviceTs = await fs.readFile(updatedModuleServicePath, 'utf-8');
        const updatedModuleTs = parseTemplateString(moduleTs, name);
        const updatedStyleCss = parseTemplateString(styleCss, name);
        const updatedComponentTsx = parseTemplateString(componentTsx, name);
        const updatedServiceTs = parseTemplateString(serviceTs, name);
        await fs.writeFile(updatedModuleTsPath, updatedModuleTs);
        await fs.writeFile(updatedModuleCssPath, updatedStyleCss);
        await fs.writeFile(updatedModuleTsxPath, updatedComponentTsx);
        await fs.writeFile(updatedModuleServicePath, updatedServiceTs);
        // console the generated file names
        console.log(`\n/\n-- ${kebabCase(name)}/\n---- ${kebabCase(name)}.module.ts\n---- ${kebabCase(name)}.service.ts\n---- ${kebabCase(name)}.component.tsx\n---- ${kebabCase(name)}.style.css\n`);
        generatingProcess.succeed(colors.green(`Module ${camelCase(name)} generated.`));
    }
    catch (error) {
        if (generatingProcess.isSpinning) {
            generatingProcess.fail(colors.red("Generation process interrupted."));
        }
        throw error;
    }
}
async function generateNewModuleClass({ name, templateDir, projectDir }) {
    const generatingProcess = ora();
    generatingProcess.start(colors.cyan(`Generating module class ${camelCase(name)}...`));
    // Copy the template files to the project directory
    try {
        const kebabedName = kebabCase(name);
        // Rename the files $1.module.ts to camelCasedName.module.ts
        const moduleTsPath = path.join(projectDir, '$kebabed.module.ts');
        const updatedModuleTsPath = path.join(projectDir, `${kebabedName}.module.ts`);
        // delete file if exists
        if (await fs.pathExists(updatedModuleTsPath)) {
            await fs.remove(updatedModuleTsPath);
        }
        await fs.copy(templateDir, projectDir);
        await fs.rename(moduleTsPath, updatedModuleTsPath);
        // replace every $1 in the file with camelCasedName and $2 with capitalizedCamelCasedName
        const moduleTs = await fs.readFile(updatedModuleTsPath, 'utf-8');
        const updatedModuleTs = parseTemplateString(moduleTs, name);
        await fs.writeFile(updatedModuleTsPath, updatedModuleTs);
        // console the generated file names
        console.log(`\n/\n-- ${kebabCase(name)}/\n---- ${kebabCase(name)}.module.ts\n`);
        generatingProcess.succeed(colors.green(`Module class ${camelCase(name)} generated.`));
    }
    catch (error) {
        if (generatingProcess.isSpinning) {
            generatingProcess.fail(colors.red("Generation process interrupted."));
        }
        throw error;
    }
}
async function generateNewModuleComponent({ name, templateDir, projectDir }) {
    const generatingProcess = ora();
    generatingProcess.start(colors.cyan(`Generating module component ${camelCase(name)}...`));
    // Copy the template files to the project directory
    try {
        const kebabedName = kebabCase(name);
        // Rename the files $1.component.tsx and $1.style.css to camelCasedName.component.ts and camelCasedName.style.css
        const componentTsPath = path.join(projectDir, '$kebabed.component.tsx');
        const componentCssPath = path.join(projectDir, '$kebabed.style.css');
        const updatedComponentTsPath = path.join(projectDir, `${kebabedName}.component.tsx`);
        const updatedComponentCssPath = path.join(projectDir, `${kebabedName}.style.css`);
        // delete file if exists
        if (await fs.pathExists(updatedComponentTsPath)) {
            await fs.remove(updatedComponentTsPath);
        }
        if (await fs.pathExists(updatedComponentCssPath)) {
            await fs.remove(updatedComponentCssPath);
        }
        await fs.copy(templateDir, projectDir);
        await fs.copy(templateDir, projectDir);
        await fs.rename(componentTsPath, updatedComponentTsPath);
        await fs.rename(componentCssPath, updatedComponentCssPath);
        // replace every $1 in the file with camelCasedName and $2 with capitalizedCamelCasedName
        const componentTs = await fs.readFile(updatedComponentTsPath, 'utf-8');
        const componentCss = await fs.readFile(updatedComponentCssPath, 'utf-8');
        const updatedComponentTs = parseTemplateString(componentTs, name);
        const updatedComponentCss = parseTemplateString(componentCss, name);
        await fs.writeFile(updatedComponentTsPath, updatedComponentTs);
        await fs.writeFile(updatedComponentCssPath, updatedComponentCss);
        // console the generated file names
        console.log(`\n/\n-- ${kebabCase(name)}/\n---- ${kebabCase(name)}.component.tsx\n---- ${kebabCase(name)}.style.css\n`);
        generatingProcess.succeed(colors.green(`Module component ${camelCase(name)} generated.`));
    }
    catch (error) {
        if (generatingProcess.isSpinning) {
            generatingProcess.fail(colors.red("Generation process interrupted."));
        }
        throw error;
    }
}
async function generateNewService({ name, templateDir, projectDir }) {
    const generatingProcess = ora();
    generatingProcess.start(colors.cyan(`Generating service ${camelCase(name)}...`));
    // Copy the template files to the project directory
    try {
        const kebabedName = kebabCase(name);
        // Rename the files $1.service.ts to camelCasedName.service.ts
        const serviceTsPath = path.join(projectDir, '$kebabed.service.ts');
        const updatedServiceTsPath = path.join(projectDir, `${kebabedName}.service.ts`);
        // delete file if exists
        if (await fs.pathExists(updatedServiceTsPath)) {
            await fs.remove(updatedServiceTsPath);
        }
        await fs.copy(templateDir, projectDir);
        await fs.rename(serviceTsPath, updatedServiceTsPath);
        // replace every $1 in the file with camelCasedName and $2 with capitalizedCamelCasedName
        const serviceTs = await fs.readFile(updatedServiceTsPath, 'utf-8');
        const updatedServiceTs = parseTemplateString(serviceTs, name);
        await fs.writeFile(updatedServiceTsPath, updatedServiceTs);
        // console the generated file names
        console.log(`\n/\n-- ${kebabCase(name)}/\n---- ${kebabCase(name)}.service.ts\n`);
        generatingProcess.succeed(colors.green(`Service ${camelCase(name)} generated.`));
    }
    catch (error) {
        if (generatingProcess.isSpinning) {
            generatingProcess.fail(colors.red("Generation process interrupted."));
        }
        throw error;
    }
}
//# sourceMappingURL=index.js.map