import { exec } from 'child_process';
import { createInterface } from 'readline';
import fs from 'fs-extra';
import { extname, join } from 'path';
import { minify } from 'terser';
const AvailableUnits = ['moduleClass', 'service', 'moduleComponent'];
export async function runInDir(command, dir) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: dir }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}
export async function promptUser(message) {
    const { value } = await new Promise((resolve) => {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(message, (value) => {
            rl.close();
            resolve({ value });
        });
    });
    return value;
}
export async function minifyReactChunks(srcDir, outDir) {
    fs.readdirSync(srcDir).forEach(async (fileName) => {
        const filePath = join(srcDir, fileName);
        if (fs.statSync(filePath).isFile() && extname(filePath) === '.js' && fileName.startsWith('react')) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            try {
                const minified = await minify(fileContent);
                const outputFilePath = join(outDir, fileName);
                fs.writeFileSync(outputFilePath, minified.code);
            }
            catch (error) {
                console.log(`Error occurred while minifying ${filePath}:\n ${error}`);
            }
        }
    });
}
export async function getViteDevPort() {
    const viteConfigPath = join(process.cwd(), 'vite.config.js');
    const viteConfig = await import(`file://${viteConfigPath}`);
    return viteConfig.default.port || 3001;
}
export async function getVitePreviewPort() {
    const viteConfigPath = join(process.cwd(), 'vite.config.js');
    const viteConfig = await import(`file://${viteConfigPath}`);
    return viteConfig.default.preview.port || 3201;
}
export function camelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export function kebabCase(str) {
    return str.replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
export function regularCase(str) {
    const kebabed = kebabCase(str);
    return kebabed.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
export function parseTemplateString(template, name) {
    return template.replace(/\$regularized/g, regularCase(name)).replace(/\$camelized/g, camelCase(name)).replace(/\$kebabed/g, kebabCase(name)).replace(/\$capitalized/g, capitalize(camelCase(name)));
}
export function getUnitName(name, type) {
    const INewTypes = getAvailableTypes();
    switch (type) {
        case INewTypes.MODULE_CLASS:
            return `${kebabCase(name)}.module.ts`;
        case INewTypes.SERVICE:
            return `${kebabCase(name)}.service.ts`;
        case INewTypes.MODULE_COMPONENT:
            return `${kebabCase(name)}.component.tsx`;
        default:
            return '';
    }
}
export function getAvailableTypes() {
    const INewTypes = {
        APP: 'app',
        MODULE: 'module',
        MODULE_CLASS: 'moduleClass',
        SERVICE: 'service',
        MODULE_COMPONENT: 'moduleComponent',
    };
    return INewTypes;
}
export function getAvailableUnits() {
    return AvailableUnits;
}
//# sourceMappingURL=index.js.map