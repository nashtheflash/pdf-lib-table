import { componentsToColor } from "pdf-lib";


export function processorData(data, columns) {

    // const columnWidths = calcColumnWidths(data, columns, options);





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
    const { headerTextSize, headerFont, maxTableWidth } = options;

    let columnDimensions;

    columns.forEach((col) => {
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, col.header);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: columnMinWidth,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(columnMinWidth, maxTableWidth),
        }};
    });

    return columnDimensions;

}

export function columnWidthWrap(columns, options) {
    const { headerTextSize, headerFont, maxTableWidth } = options;

    let columnDimensions;

    columns.forEach((col) => {
        const headerStringLength = getTextWidth(headerFont, headerTextSize, col.header);
        const longestHeaderWord = getLongestWordFromString(col.header, options);
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, longestHeaderWord);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: headerStringLength,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(headerStringLength, maxTableWidth),
        }};
    });

    return columnDimensions;
}

export function wrapHeader({columns, columnDimensions, headerLineHeight, headerTextSize, headerFont, additionalWrapCharacters}) {
    const  wrappedHeaders = columns.map(({ columnId, header }) => {
        const wrappedText = getWrapedText(headerFont, headerTextSize, columnDimensions[columnId].actualWidth, header, additionalWrapCharacters);
        return { columnId: columnId, data: wrappedText, height: wrappedText.length * headerLineHeight }
    });

    return wrappedHeaders;
}

export function calcColumnWidths(data, columnHeaderWidths, maxTableHeight, options) {
    
    //most of these are optomizations
    let columnDimensions = columnHeaderWidths;
    let tableData = [];
    let currentInternalTableDimensions;

    const  dataLength = data.length;
    for (let loop = 0; loop < dataLength; loop++){
        tableData.push(data[loop])
        
        const finalColumnDimensions = adjustColumnWidth({ rowData: data[loop], rowType: data[loop].type, tableData, columnDimensions, currentInternalTableDimensions, maxTableHeight, options }); //TODO: this needs to just run the calc on one row. then check to see if the data needs to be updated
        
        const prevWrapedData = currentInternalTableDimensions ? currentInternalTableDimensions[0] : {}
        const [tableHeight, wrappedTableData] = getTableHeight({ rowData: data[loop], tableData, columnDimensions, finalColumnDimensions, prevWrapedData, options })

        if(tableHeight > maxTableHeight) {
            tableData.pop();
            return;
        }
        
        if(tableHeight < maxTableHeight && loop == data.length - 1) {
            currentInternalTableDimensions = [finalColumnDimensions, tableData, wrappedTableData]
            columnDimensions = finalColumnDimensions
        }
    };

    const remainingData = data.slice(tableData.length);

    const [finalColumnDimensions, tableHeight, wrappedTableData] = currentInternalTableDimensions;
    return [finalColumnDimensions, tableHeight, wrappedTableData, remainingData];
};

export function getTableHeight({ rowData, tableData, columnDimensions, finalColumnDimensions, prevWrapedData, options }) {
    //if the data is unchanged. dont run calcRowHeights
    let wrappedTableData;
    let tableHeight;

    if(JSON.stringify(finalColumnDimensions) === JSON.stringify(columnDimensions)){
        //only calc new row
        const [wrappedTbleData, tblHeight] = calcRowHeights(rowData, finalColumnDimensions, options);
        
        wrappedTableData = {...prevWrapedData, ...wrappedTbleData};
        tableHeight = tblHeight;
    } else {
        //calc entire table
        const [wrappedTbleData, tblHeight] = calcRowHeights(tableData, finalColumnDimensions, options);

        wrappedTableData = wrappedTbleData;
        tableHeight = tblHeight;
    }

    return [tableHeight, wrappedTableData]
};


export function adjustColumnWidth({ rowData, rowType, tableData, columnDimensions, currentInternalTableDimensions, options }){
    const { cellFont, cellTextSize, maxTableWidth, startingY, subheadingWrapText, subheadingColumns } = options;
    let adjustedColumnDimensions = columnDimensions
    
    Object.keys(adjustedColumnDimensions).forEach((col) => {
        if(rowType === 'subheading' && !subheadingWrapText) return;
        //the below modifies the column if it is a subheading
        const subheadingDef = rowType === 'subheading' ? subheadingColumns.find(({parentId}) => parentId === col) : undefined;
        const parentColumnId = rowType === 'subheading' ? subheadingDef.parentId : col;
        const sunHeadingColumnId = rowType === 'subheading' ? subheadingDef.columnId : col;
        
        const cellStringLength = getTextWidth(cellFont, cellTextSize, rowData.data[sunHeadingColumnId]);
        const longestCellWord = getLongestWordFromString(rowData.data[sunHeadingColumnId], options);
        const cellMinWidth = getTextWidth(cellFont, cellTextSize, longestCellWord);
        
        if(adjustedColumnDimensions[parentColumnId].columnMinWidth < cellMinWidth) adjustedColumnDimensions[parentColumnId].columnMinWidth = cellMinWidth;
        if(adjustedColumnDimensions[parentColumnId].maxColumnWidth < cellStringLength) adjustedColumnDimensions[parentColumnId].maxColumnWidth = cellStringLength;
        adjustedColumnDimensions[parentColumnId].intrinsicPercentageWidth = updateIntrinsicPercentageWidth(adjustedColumnDimensions[parentColumnId].maxColumnWidth, maxTableWidth);
    });
    
    //Find the actual column widths
    const finalColumnDimensions = distributeExcessTableWidth(tableData, adjustedColumnDimensions, options);
    

    return finalColumnDimensions //adjust this...
};

export function distributeExcessTableWidth(data, columnDimensions, options){
    const { maxTableWidth } = options;
    const columnTotals = sumColumnProperties(columnDimensions);

    //All columns can take as much space as they need. No wraping is required
    if(columnTotals.intrinsicPercentageWidth <= 100) {
        return assignFullColumnWidths(columnDimensions, maxTableWidth, columnTotals);
    }
    
    //Some column warpping will occore
    if(columnTotals.intrinsicPercentageWidth > 100 && columnTotals.columnMinWidth < maxTableWidth) {
        //the column min widths fit in the table
        return assignIntrinsicBasedColumnWidths(columnDimensions, maxTableWidth, columnTotals);
    }

    if(columnTotals.intrinsicPercentageWidth > 100 && columnTotals.columnMinWidth > maxTableWidth) {
        console.log('Column Overflow')   
    }
};

export function assignIntrinsicBasedColumnWidths(columnDimensions, maxTableWidth, columnTotals) {
    //the measurment will start at the min width then then distrubute excess based on the intrinsicPercentageWidth
    let actialWidth = {};

    const totalNumberOfColumns = Object.keys(columnDimensions).length;
    const columnsRecivingWidth = fileterObject(columnDimensions, obj => obj.columnMinWidth !== obj.maxColumnWidth);
    const columnsRecivingWidthintrinsicPercentageTotal = Object.values(columnsRecivingWidth).reduce((acc, obj)  => acc + obj.intrinsicPercentageWidth , 0);
    const excessWidth = maxTableWidth - columnTotals.columnMinWidth;

    Object.keys(columnDimensions).forEach((col) => {
        const { columnMinWidth, intrinsicPercentageWidth, maxColumnWidth } = columnDimensions[col];
        
        if(columnMinWidth == maxColumnWidth) actialWidth[col] = {...columnDimensions[col], actualWidth: columnMinWidth};
        
        if(columnMinWidth != maxColumnWidth) {
            const width = excessWidth * (intrinsicPercentageWidth / columnsRecivingWidthintrinsicPercentageTotal) + columnMinWidth;
            actialWidth[col] = {...columnDimensions[col], actualWidth: width}
        };

    });

    return actialWidth
}

export function assignFullColumnWidths(columnDimensions, maxTableWidth, columnTotals) {
    //set all columns to there max width. Then give any extra space out evenly
    let actialWidth = {};
    
    const numberofColumns = Object.keys(columnDimensions).length;
    const excessWidth = maxTableWidth - columnTotals.maxColumnWidth;
    const widthToAddToEachColumn = excessWidth / numberofColumns;

    Object.keys(columnDimensions).forEach((col) => actialWidth[col] = {...columnDimensions[col], actualWidth: columnDimensions[col].maxColumnWidth + widthToAddToEachColumn});

    return actialWidth
}

export function sumColumnProperties(columnDimensions) {
    return Object.values(columnDimensions).reduce((acc, obj) => {
        acc.columnMinWidth += obj.columnMinWidth;
        acc.intrinsicPercentageWidth += obj.intrinsicPercentageWidth;
        acc.maxColumnWidth += obj.maxColumnWidth;
        return acc;
    }, {columnMinWidth: 0, intrinsicPercentageWidth: 0, maxColumnWidth: 0});
}

export function calcRowHeights(data, columnDimensions, options){
    let tableData = [...data];
    let currentTableHeight = 0;
    
    tableData.forEach((row, i) => {
        const [rowHeight, wrappedData] = getRowHeightAndWrapText(row, columnDimensions, options);
        
        tableData[i] = {...tableData[i], rowHeight, data: wrappedData};
        currentTableHeight += rowHeight
    });
    

    return [tableData, currentTableHeight];
};

export function getRowHeightAndWrapText(row, columnWidths, options) {
    const { cellFont, cellTextSize, cellLineHeight, subheadingWrapText, subHeadingFont, subHeadingLineHeight, subHeadingTextSize, subheadingColumns, additionalWrapCharacters } = options;

    let tallestCell = 0;
    let wrappedData = {...row.data};
    Object.keys(row.data).forEach(cell => {
        
        if(row.type === 'row') {
            const wrappedText = getWrapedText(cellFont, cellTextSize, columnWidths[cell].actualWidth, row.data[cell], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [cell]: wrappedText}
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };

        // if(row.type === 'subheading' && subheadingWrapText) {
        //     const subheadingDef = subheadingColumns.find(({parentId}) => parentId === col);
        //     const parentColumnId = subheadingDef.parentId;
        //     const sunHeadingColumnId = subheadingDef.columnId;

        //     const wrappedText = getWrapedText(subHeadingFont, subHeadingTextSize, columnWidths[parentColumnId].actualWidth, row.data[sunHeadingColumnId], additionalWrapCharacters);
        //     wrappedData = { ...wrappedData, [cell]: wrappedText}
        //     if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        // };
        
        // if(row.type === 'subheading' && !subheadingWrapText) {
        //     tallestCell = ['subheading']; // if there is no wrapping the array length will only ever be 1
        // };
    });
    
    const rowHeight = row.type === 'row' ? tallestCell * cellLineHeight : tallestCell * subHeadingLineHeight;

    return [rowHeight, wrappedData]; //TODO: THIS IS THE FINAL DATA THAT I NEED!!!!!!!!
};

export function updateIntrinsicPercentageWidth(maxColumnLength, tableWidth) {
    return (maxColumnLength / tableWidth) * 100;
};

export const getWrapedText = (font, fontSize, textAreaSize, text, additionalWrapCharacters) => {
    const words = brakeStringIntoWords(text, additionalWrapCharacters);
    const wordsLength = words.length;

    let currentLine = '';
    let currentLineLength = 0;
    let lines = [];

    for (let loop = 0; loop < wordsLength; loop++) {
        // const currentWordLength = getTextWidth(font, fontSize, words[loop]+' ') + 1.3;
        const currentWordLength = getTextWidth(font, fontSize, words[loop]);
        
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