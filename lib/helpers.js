export const getWrapedText = (font, fontSize, textAreaSize, text, additionalWrapCharacters) => {
    const words = brakeStringIntoWords(text, additionalWrapCharacters);
    const wordsLength = words.length;

    let currentLine = '';
    let currentLineLength = 0;
    let lines = [];

    for (let loop = 0; loop < wordsLength; loop++) {
        //TODO: I am doing this due to PDF-Lib not supporting kerning. This makes it hard to wrap lines. I can proabably solve this better a diffrent way
        let currentWordLength;
        if(wordsLength == 1) currentWordLength = getTextWidth(font, fontSize, words[loop]+' '); //this line did not have the space when built. this is finiky to get right and may need to be adjusted further
        if(wordsLength > 1) currentWordLength = getTextWidth(font, fontSize, words[loop]+' ');
        
        if (currentWordLength + currentLineLength > textAreaSize) {
            //current word makes the line overflow
            lines.push(currentLine);
            currentLine = words[loop];
            currentLineLength = currentWordLength;
        } else if(loop == wordsLength - 1) {
            //last word in the string
            currentLine = currentLine != '' ? currentLine + ' ' + words[loop] : words[loop];
            lines.push(currentLine);
        } else if (currentWordLength + currentLineLength < textAreaSize) {
            //current word does not make the line overflow. add the word to the current line and continue
            currentLine = currentLine != '' ? currentLine + ' ' + words[loop] : words[loop];
            currentLineLength += currentWordLength;
        }
    }
    return lines;
};

export const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);

//this function takes a string and and charicters the string neeeds to be brioken by and returns a array of words
export const brakeStringIntoWords = (word, char) => {
    let words = word.split(' ');

    if(char && char.length !== 0) {
        char.forEach((sym) => {
        words = words.map((word) => word.split(sym))
        })
    };
    return [...words.flat(Infinity)];
};

export function getLongestWordFromString(string, options) {
    const { additionalWrapCharacters } = options;
    
    const words = brakeStringIntoWords(string, additionalWrapCharacters);
    const sortedWords = words.sort((a, b) => b.length - a.length);
    const longestWord = sortedWords[0];

    return longestWord;

};

export function fileterObject(obj, predicate) {
    return Object.keys(obj)
    .filter( key => predicate(obj[key]) )
    .reduce( (res, key) => (res[key] = obj[key], res), {} );
};

export function sumColumnProperties(columnDimensions) {
    return Object.values(columnDimensions).reduce((acc, obj) => {
        acc.columnMinWidth += obj.columnMinWidth;
        acc.intrinsicPercentageWidth += obj.intrinsicPercentageWidth;
        acc.maxColumnWidth += obj.maxColumnWidth;
        return acc;
    }, {columnMinWidth: 0, intrinsicPercentageWidth: 0, maxColumnWidth: 0});
}

export function getParentColumnId(column, subHeadingDefs) {
    const def = subHeadingDefs.find(({columnId}) => columnId === column); 
    const col = def?.parentId ? def.parentId : undefined;
    return col;
}

export function getChildColumnId(column, subHeadingDefs) {
    const def = subHeadingDefs.find(({parentId}) => parentId === column); 
    const col = def?.columnId ? def.columnId : undefined;
    return col;
}
