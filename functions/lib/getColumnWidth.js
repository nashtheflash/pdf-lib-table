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

export const getMinColumnWidth = (data, columns, cellFont, cellTextSize, additionalWrapCharacters) => {
    let rowData = {};

    //build the rowdata var out for next step
    columns.forEach(({ columnId }) => rowData = {...rowData, [columnId]: []});

    //breakes down all of the strings to words or user specifid brake points
    data.forEach((row) => {
        Object.keys(row).forEach((rowVal) => {
        rowData[rowVal] = [...rowData[rowVal], ...breakWord(row[rowVal].toString(), additionalWrapCharacters)]
        })
    });
        
    //order items from smalles to largest numbers will go the the front
    Object.keys(rowData).forEach(row => {
        rowData[row].sort((a,b) => a.length > b.length || typeof a !== 'number' ? 1 : -1);
    });

    //gets the largest and smallest item
    Object.keys(rowData).forEach(row => {
        rowData[row] = [rowData[row].shift(), rowData[row].pop()]
    })

    //gets the minumum width for the column
    Object.keys(rowData).forEach(row => {
        rowData[row] = Math.max(getTextWidth(cellFont, cellTextSize, rowData[row][0]), getTextWidth(cellFont, cellTextSize, rowData[row][1]))
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