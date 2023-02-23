import fs from 'fs';
import path from 'path';
import { config1 } from '../config/structure-configuration.json';


export class Config {
    private readonly pathFileConfig: string = path.join(path.resolve(__dirname), '../config/structure-configuration.json');
    protected config = config1;

    getSubdirs() {
        return Object.keys(this.config.subDir);
    }

}

export { config1 };