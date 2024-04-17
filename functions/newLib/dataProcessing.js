export const getTextWidth = (font, size, text) => font.widthOfTextAtSize(text, size);

export function processorData(data, columns) {

    const columnWidths = calcColumnWidths(data, columns);





    // console.log(data, columns)
    // find the largest header item. This is the min width.
    

    // assume the data is whats left to print
    // is there is a word that is larger than the current min width adjust the min width

    // add the remainig space to the columns that are not still set to the header. header items are empty and should not get extra space.
}

export function calcColumnHeaderWidths(columns, options) {
    const { headerWrapText } = options;
    let columnDimensions;
    
    if(!headerWrapText) {
        columnDimensions = columnWidthNoWrap(columns, options);
    } else {
        columnDimensions = columnWidthWrap(columns, options);
    }

    return columnDimensions;
};

export function columnWidthNoWrap(columns, options) {
    const { headerTextSize, headerFont } = options;

    let columnDimensions;

    columns.forEach((col) => {
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, col.header);

        columnDimensions =  {...columnDimensions, [col.header]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: columnMinWidth,
            intrinsicPercentageWidth: undefined,
        }};
    });

    return columnDimensions;

}

export function getLongestWordFromString(string, options) {
    const { additionalWrapCharacters } = options;
    
    const words = brakeStringIntoWords(string, additionalWrapCharacters);
    const sortedWords = words.sort((a, b) => b.length - a.length);
    const longestWord = sortedWords[0];

    return longestWord;

}

export function columnWidthWrap(columns, options) {
    const { headerTextSize, headerFont } = options;

    let columnDimensions;

    columns.forEach((col) => {
        const longestHeaderWord = getLongestWordFromString(col.header, options)
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, longestHeaderWord);

        columnDimensions =  {...columnDimensions, [col.header]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: columnMinWidth,
            intrinsicPercentageWidth: undefined,
        }};
    });

    return columnDimensions;

}

export function calcColumnWidths(data, options, columnHeaderWidths) {
    console.log(columnHeaderWidths)

    //TODO: start here, need to go row by row to add the demenions to the width then check to see if the height has overflowed the page.
    
    //const { cellTextSize, cellFont, headerTextSize, headerFont } = options;
    //let columnDimensions;
    

    // //Adjusting sizing per row
    // columns.forEach((col) => {
    //     const columnMinWidth = getTextWidth(headerFont, headerTextSize, col.header);

    //     columnDimensions =  {...columnDimensions, [col.header]: {
    //         columnMinWidth: columnMinWidth,
    //         maxColumnWidth: columnMinWidth,
    //         intrinsicPercentageWidth: undefined,
    //     }};
    // });

    





}

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