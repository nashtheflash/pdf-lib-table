

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

export function calcColumnWidths(data, columnHeaderWidths, options, page) {
    
    const { startingY } = options;
    const maxTableHeight = page.dimensions[1] - (page.dimensions[1] - startingY)//TODO: this needs to come from the table...
    const  dataLength = data.length;
    
    //most of these are optomizations
    let columnDimensions = columnHeaderWidths;
    let currentColumnDimensionsCalc;
    let verticalDimensions;
    let tableData = [];
    let prevColumnDimensions;

    const t0 = performance.now();
    for (let loop = 0; loop < dataLength; loop++){
        tableData.push(data[loop])
        
        const [finalColumnDimensions, finalverticalDimensions, dt] = adjustColumnWidth({ rowData: data[loop], rowType: data[loop].type, tableData, columnDimensions, currentColumnDimensionsCalc, maxTableHeight, verticalDimensions, options }); //TODO: this needs to just run the calc on one row. then check to see if the data needs to be updated
        //Below are optomizations.
        prevColumnDimensions = [finalColumnDimensions, finalverticalDimensions, dt]; //stash the data incase the table overflows the page
        currentColumnDimensionsCalc = finalColumnDimensions //stash the data to avoid running calcs if the dementions are unchanged
        verticalDimensions = finalverticalDimensions;
        
        if(finalverticalDimensions.currentTableHeight > maxTableHeight) {
            tableData.pop();
            columnDimensions = previousColumnDimensions[0];
            verticalDimensions = previousverticalDimensions[1];
        }
        
        if(finalverticalDimensions.currentTableHeight < maxTableHeight && loop == data.length - 1) {
            columnDimensions = finalColumnDimensions;
            verticalDimensions = finalverticalDimensions;
        }
        
    }
    const t1 = performance.now();
    // console.log(`calcColumnWidths took ${t1 - t0} milliseconds.`);

    const remainingData = data.slice(tableData.length);
    


    return [columnDimensions, verticalDimensions, tableData, remainingData];
};


export function adjustColumnWidth({ rowData, rowType, tableData, columnDimensions, currentColumnDimensionsCalc, verticalDimensions, options }){
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
    
    //if(adjustedColumnDimensions == columnDimensions) return [columnDimensions, verticalDimensions, tableData]
    
    //Find the actual column widths
    const finalColumnDimensions = distributeExcessTableWidth(tableData, adjustedColumnDimensions, options);
    
    // console.log(finalColumnDimensions, currentColumnDimensionsCalc);
    // console.log(JSON.stringify(finalColumnDimensions) === JSON.stringify(currentColumnDimensionsCalc))
    if(JSON.stringify(finalColumnDimensions) === JSON.stringify(currentColumnDimensionsCalc)) return [finalColumnDimensions, verticalDimensions, tableData]
    //Assign Row Heights
    const t0 = performance.now();
    const finalVerticalDimensions = calcRowHeights(tableData, finalColumnDimensions, options);
    const t1 = performance.now();

    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
    return [finalColumnDimensions, finalVerticalDimensions, tableData] //adjust this...
};

export function distributeExcessTableWidth(data, columnDimensions, options){
    const { maxTableWidth } = options;
    const columnTotals = sumColumnProperties(columnDimensions);

    //All columns can take as much space as they need. No wraping is required
    if(columnTotals.intrinsicPercentageWidth <= 100) {
        // console.log('assignFullColumnWidths', columnTotals.intrinsicPercentageWidth)
        return assignFullColumnWidths(columnDimensions, maxTableWidth, columnTotals);
    }
    
    //Some column warpping will occore
    if(columnTotals.intrinsicPercentageWidth > 100 && columnTotals.columnMinWidth < maxTableWidth) {
        // console.log('assignIntrinsicBasedColumnWidths', columnTotals.intrinsicPercentageWidth)
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
            const width = excessWidth * (intrinsicPercentageWidth / columnsRecivingWidthintrinsicPercentageTotal);
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
    let tableData = data;
    let currentTableHeight = 0;
    
    const t0 = performance.now();
    tableData.forEach((row, i) => {
        console.log(row, i)
        const rowHeight = getRowHeight(tableData, columnDimensions, options);
        
        tableData[i] = {...tableData[i], rowHeight};
        currentTableHeight += rowHeight
    });
    
    const t1 = performance.now();
    // console.log(`Call to doSomething took ${t1 - t0} milliseconds.`); //TODO: this is the preformace issue

    return {tableData, currentTableHeight};
};

export function getRowHeight(tableData, columnWidths, options) {
    const { cellFont, cellTextSize, cellLineHeight, subheadingWrapText, subHeadingFont, subHeadingLineHeight, subHeadingTextSize, subheadingColumns, additionalWrapCharacters } = options;

    const rowdata = tableData.map(row => {
        let tallestCell;
        
        if(row.type === 'row') {
            //console.log('ROW')
            tallestCell = Object.keys(row.data).reduce((longest, col) => {
                const wrappedText = getWrapedText(cellFont, cellTextSize, columnWidths[col].actualWidth, row.data[col], additionalWrapCharacters);
                return wrappedText.length > longest.length ? wrappedText : longest;
            }, []);
        }

        if(row.type === 'subheading' && subheadingWrapText) {
            const subheadingDef = subheadingColumns.find(({parentId}) => parentId === col);
                
            const parentColumnId = subheadingDef.parentId;
            const sunHeadingColumnId = subheadingDef.columnId;

            tallestCell = Object.keys(row.data).reduce((longest, col) => {
                const wrappedText = getWrapedText(subHeadingFont, subHeadingTextSize, columnWidths[parentColumnId].actualWidth, row.data[sunHeadingColumnId], additionalWrapCharacters);
                return wrappedText.length > longest.length ? wrappedText : longest;
            }, []);
        }
        
        if(row.type === 'subheading' && !subheadingWrapText) {
            tallestCell = ['subheading']; // if there is no wrapping the array length will only ever be 1
        }

        const rowHeight = row.type === 'row' ? tallestCell.length * cellLineHeight : tallestCell.length * subHeadingLineHeight


        return rowHeight;
    });
    
    return Math.max(...rowdata);
};

export function updateIntrinsicPercentageWidth(maxColumnLength, tableWidth) {
    return (maxColumnLength / tableWidth) * 100;
};

export const getWrapedText = (font, fontSize, textAreaSize, text, additionalWrapCharacters) => {
    const words = brakeStringIntoWords(text.toString(), additionalWrapCharacters);
    const wordsLength = words.length;

    let currentLine = '';
    let currentLineLength = 0;
    let lines = [];

    for (let loop = 0; loop < wordsLength; loop++) {
        const currentWordLength = getTextWidth(font, fontSize, words[loop]+' ') + 1.3;
        // const currentWord = getTextWidth(font, fontSize, words[loop]);

        //currentLine == '' ? currentLine = words[loop] : currentLine = currentLine.concat(' ', words[loop]);

        //there are no more words to search. This is the last line of test and it is not overflowing
        if(currentLine != '' && loop == wordsLength - 1) {
            lines.push(currentLine);
            return;
        }

        //current word makes the line overflow
        if (currentWordLength + currentWordLength > textAreaSize && words.length !== 0) {
            // const wordArray = currentLine.split(' ');
            // const overFlowedWord = wordArray.pop();
            lines.push(currentLine);
            currentLine = words[loop];
            currentLineLength = currentWordLength;
            //return;
        };
        
        //current word does not make the line overflow. add the word to the current line and continue
        if (currentWordLength + currentWordLength < textAreaSize && words.length !== 0) {
            currentLine.concat(' ', words[loop])
            currentLineLength += currentWordLength;
           //return;
        };

        
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