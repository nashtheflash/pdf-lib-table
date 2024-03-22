import { getTextWidth } from ".";

/**
 * Thsi shoule be the onlu place that column wisths are set.
 */

export const tableColumnWidths = (data, columns, startingX, startingY, maxTableWidth, pageWidth, cellFont, cellTextSize, additionalWrapCharacters) => {

    //this should be the min column width by column
    const minColumnWidth = getMinColumnWidth(data, columns, cellFont, cellTextSize, additionalWrapCharacters);
    const tableWidth = maxTableWidth && maxTableWidth < (pageWidth - startingX) ? maxTableWidth : (pageWidth - startingX);
    const finalSizing = spaceColumns(minColumnWidth, columns, tableWidth);
    return finalSizing;
};

export const spaceColumns = (minColumnWidth, columns, tableWidth) => {
    const minumumTableWidth = Object.values(minColumnWidth).reduce((partialSum, a) => partialSum + a, 0);
    const extraWidth = tableWidth - minumumTableWidth
    const widthForColumns = extraWidth / columns.length
    
    const finalSizing = Object.fromEntries(
        Object.entries(minColumnWidth).map(([col, width]) => [col, width + widthForColumns])
    );
    
    return finalSizing;
};

export const getMinColumnWidth = (data, columns, cellFont, cellTextSize, headerFont, headerTextSize, additionalWrapCharacters) => {
    let rowData = {};

    //build the rowdata var out for next step
    columns.forEach(({ columnId }) => rowData = {...rowData, [columnId]: []});
    //breakes down all of the strings to words or user specifid brake points
    
    // data.forEach((row) => { removed because below is way faster
    //     Object.keys(row).forEach((rowVal) => {
    //         rowData[rowVal] = [...rowData[rowVal], ...breakWord(row[rowVal].toString(), additionalWrapCharacters)]
    //     })
    // });

    const keys = Object.keys(data[0]); // Assuming all rows have the same keys
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        for (let j = 0; j < keys.length; j++) {
            const rowVal = keys[j];
            const value = row[rowVal];
            const words = breakWord(value.toString(), additionalWrapCharacters);
            if (!rowData[rowVal]) {
                rowData[rowVal] = words;
            } else {
                rowData[rowVal].push(...words);
            }
        }
    }
    
    //order items from smalles to largest numbers will go to the front
    Object.keys(rowData).forEach(row => {
        rowData[row].sort((a,b) => a.length > b.length ? 1 : -1);
    });
    
    //gets the minumum width for the column
    Object.keys(rowData).forEach((row) => {
        const columnHeader = columns.find((col) => col.columnId == row).header;
        const longestColumnItem = rowData[row][rowData[row].length -1];
        
        rowData[row] = Math.max(getTextWidth(headerFont, headerTextSize, columnHeader), getTextWidth(cellFont, cellTextSize, longestColumnItem))
    })
    
    return rowData
};

export const breakWord = (word, char) => {
    let words = word.split(' ');

    if(char && char.length !== 0) {
        char.forEach((sym) => {
        words = words.map((word) => word.split(sym))
        //words = word.split(sym)
        })
    };

    return [...words.flat(Infinity)];
};