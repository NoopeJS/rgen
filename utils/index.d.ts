export declare function runInDir(command: string, dir: string): Promise<unknown>;
export declare function promptUser(message: string): Promise<string>;
export declare function minifyReactChunks(srcDir: string, outDir: string): Promise<void>;
export declare function getViteDevPort(): Promise<any>;
export declare function getVitePreviewPort(): Promise<any>;
export declare function camelCase(str: string): string;
export declare function capitalize(str: string): string;
