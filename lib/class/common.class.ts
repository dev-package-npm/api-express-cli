import readLine from 'readline';
import { ICommon } from './interfaces/common.interface';

export abstract class Common {

    replaceAll(data: string, key: '-' | '_' | ' ') {
        let value = this.getIndexSeparator(data).separator;
        if (value != key && value != '') {
            data = data.replaceAll(value, key);
        }
        return data;
    }

    getIndexSeparator(data: string): { separator: string; index: number } {
        let key = ['-', ' ', '_'];
        for (let index = 0; index < key.length; index++) {
            if (data.search(key[index]) != -1) return { separator: key[index], index: data.search(key[index]) };
        }
        return { separator: '', index: -1 };
    }

    addPrefix(index: number, input: string, prefix: 'Model' | 'Router' | 'Controller') {
        let name = '';
        while (index != -1) {
            name = input.slice(0, index) + input.charAt(index + 1).toUpperCase() + input.slice(index + 2);
            index = this.getIndexSeparator(name).index;
            index == -1 ? name += prefix : input = name;
        }
        return name || `${input}${prefix}`;
    }

    async isExistsWord(rl: readLine.Interface, words: Array<string>): Promise<boolean> {
        for await (const line of rl) {
            for (let index = 0; index < words.length; index++) {
                if (line.includes(words[index].replaceAll('\n', '')) != false) {
                    return true;
                }
            }
        }
        return false;
    }

}