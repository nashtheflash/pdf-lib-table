import { getTextWidth } from ".";

/**
 * This shoule be the only place that column widths are set.
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

export const getMinColumnWidth = (data, columns, columnIds, cellFont, cellTextSize, headerFont, headerTextSize, additionalWrapCharacters) => {
    let rowData = {};
    let headerData = {};

    //build the rowdata var out for next step
    columns.forEach(({ columnId }) => rowData = {...rowData, [columnId]: []});
    // rowData.filter((col) => )
    //breakes down all of the strings to words or user specifid brake points

    
    
    //Rows
    const dataLength = data.length
    let rowKeys = columnIds.filter((item) => item != 'tableRowType'); // Assuming all rows have the same keys
    for (let i = 0; i < dataLength; i++) {
        const row = data[i];
        for (let j = 0; j < rowKeys.length; j++) {
            
            
            const rowVal = rowKeys[j];
            const value = row[rowVal] || '';
            
            const words = breakWord(value.toString(), additionalWrapCharacters);
            if (!rowData[rowVal]) {
                rowData[rowVal] = words;
            } else {
                rowData[rowVal].push(...words);
            }
        }
    }
    //console.log(rowData);

    
    //Headers
    const columnLength = columns.length;
    for (let i = 0; i < columnLength; i++) {
        const header = columns[i];
        const words = breakWord(header.header.toString(), additionalWrapCharacters);
        if (!headerData[header.columnId]) {
            headerData[header.columnId] = words;
        } else {
            headerData[header.columnId].push(...words);
        }
    };
    
    
    //order rows from smalles to largest numbers will go to the front
    Object.keys(rowData).forEach(row => {
        rowData[row].sort((a,b) => a.length > b.length ? 1 : -1);
    });
    
    //order heaaders from smalles to largest numbers will go to the front
    Object.keys(headerData).forEach(header => {
        headerData[header].sort((a,b) => a.length > b.length ? 1 : -1);
    });
    
    //gets the minumum width for the column
    //console.log(Object.keys(columns))
    columns.forEach(({columnId}, i) => {
        // console.log('rowDataaaa', columnId);
        //console.log('loop',i, headerData[row], headerData, row);
        //const columnHeader = columns.find((col) => col.columnId == row).header;
        
        //if(!rowData[row].length)console.log('this row', row);
        
        const longestHeaderItem = headerData[columnId] ? headerData[columnId][headerData[columnId].length -1] : 0
        const longestColumnItem = rowData[columnId][rowData[columnId].length -1];
        
        // console.log('rowData', getTextWidth(headerFont, headerTextSize, longestHeaderItem), getTextWidth(cellFont, cellTextSize, longestColumnItem));
        
        rowData[columnId] = Math.max(getTextWidth(headerFont, headerTextSize, longestHeaderItem), getTextWidth(cellFont, cellTextSize, longestColumnItem))
    })
    // console.log(rowData);
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