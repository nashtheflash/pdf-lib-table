export const tableCells = (data, columns, columnWidths, startingX, startingY, maxTableWidth, pageWidth, cellFont, cellTextSize, cellLineHeight, additionalWrapCharacters) => {
    const rowMaster = [];

    data.forEach((row, index) => {
        let newRow = []

        Object.keys(row).forEach((col) => {
            const cellValues = getWrapedText(cellFont, cellTextSize, columnWidths[row], row[col], additionalWrapCharacters);
            newRow = [
                ... newRow, 
                {
                    colID: col, 
                    rowId: index,
                    startingX, //can probably get this later in from the column class
                    startingY, //couls mabe get this later from the row class
                    font: cellFont, 
                    textHeight: cellTextSize, 
                    lineHeight: cellLineHeight,
                    CellHeight: cellLineHeight * cellValues.length,
                    values: cellValues
                }
            ]
        });
        
        rowMaster.push(newRow)
    })
};