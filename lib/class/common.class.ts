import { exec } from 'node:child_process';
import readLine from 'readline';

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

    protected executeTerminal(params: string): Promise<string> {
        return new Promise((resovle, rejects) => {
            exec(params, (error, stdout, stderr) => {
                if (error != null)
                    rejects(new Error(String(error)));
                if (stderr != '')
                    rejects(new Error(String(stderr)));
                resovle(stdout);
            });
        });
    }
}