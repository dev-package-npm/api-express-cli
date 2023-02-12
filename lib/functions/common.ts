import readLine from 'readline';

const getIndexSeparator = (data: string): { separator: string; index: number } => {
    let key = ['-', ' ', '_'];
    for (let index = 0; index < key.length; index++) {
        if (data.search(key[index]) != -1) return { separator: key[index], index: data.search(key[index]) };
    }
    return { separator: '', index: -1 };
}

const addPrefix = (index: number, input: string, prefix: 'Model' | 'Router' | 'Controller') => {
    let name = '';
    while (index != -1) {
        name = input.slice(0, index) + input.charAt(index + 1).toUpperCase() + input.slice(index + 2);
        index = getIndexSeparator(name).index;
        index == -1 ? name += prefix : input = name;
    }
    return name || `${input}${prefix}`;
}

const replaceAll = (data: string, key: '-' | '_' | ' ') => {
    let value = getIndexSeparator(data).separator;
    if (value != key && value != '') {
        data = data.replaceAll(value, key);
    }
    return data;
}

const isExistsWord = async (lr: readLine.Interface, words: Array<string>): Promise<boolean> => {
    for await (const line of lr) {
        for (let index = 0; index < words.length; index++) {
            if (line.includes(words[index].replaceAll('\n', '')) != false) {
                return true;
            }
        }
    }
    return false;
}

export { getIndexSeparator, addPrefix, replaceAll, isExistsWord };