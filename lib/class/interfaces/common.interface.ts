interface ICommon {
    replaceAll(data: string, key: '-' | '_' | ' '): string;
    getIndexSeparator(data: string): { separator: string; index: number };
    addPrefix(index: number, input: string, prefix: 'Model' | 'Router' | 'Controller'): string
}

export {
    ICommon
}