

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
    const { cellFont, cellTextSize, maxTableWidth, startingY } = options;
    const maxTableHeight = page.dimensions[1] - (page.dimensions[1] - startingY)//TODO: this needs to come from the table...
    const columnDimensions = columnHeaderWidths;
    
    //add row
    let tableData = [];
    for (let loop = 0; loop < data.length; loop++){
        tableData.push(data[loop])

        if(data[loop].type === 'row') {
            
            Object.keys(columnDimensions).forEach((col) => {
                const cellStringLength = getTextWidth(cellFont, cellTextSize, data[loop].data[col]);
                const longestCellWord = getLongestWordFromString(data[loop].data[col], options);
                const cellMinWidth = getTextWidth(cellFont, cellTextSize, longestCellWord);
    
                if(columnDimensions[col].columnMinWidth < cellMinWidth) columnDimensions[col].columnMinWidth = cellMinWidth;
                if(columnDimensions[col].maxColumnWidth < cellStringLength) columnDimensions[col].maxColumnWidth = cellStringLength;
                columnDimensions[col].intrinsicPercentageWidth = updateIntrinsicPercentageWidth(columnDimensions[col].maxColumnWidth, maxTableWidth);
            });

            //Find the actual column widths
            const finalColumnDimensions = distributeExcessTableWidth(tableData, columnDimensions, options);

            console.log(finalColumnDimensions);
    
            //Assign Row Heights
            const verticalDimensions = calcRowHeights(tableData, finalColumnDimensions, options);

            //if the current table data is to large for the page. Remove the last item, recalc the row heights, return the data.
            if(verticalDimensions.currentTableHeight > maxTableHeight) {
                tableData.pop();
                const tableData = calcRowHeights(tableData, columnDimensions, options);
                return tableData;
            }
        }

        if(data[loop].type === 'subheader') {
            console.log('need to calc subhader')
        }
    }
}

export function distributeExcessTableWidth(data, columnDimensions, options){
    const { maxTableWidth } = options;
    const columnTotals = sumColumnProperties(columnDimensions);

    //All columns can take as much space as they need. No wraping is required
    if(columnTotals.intrinsicPercentageWidth < 100) {
        console.log('assignFullColumnWidths')
        return assignFullColumnWidths(columnDimensions, maxTableWidth, columnTotals);
    }
    
    //Some column warpping will occore
    if(columnTotals.intrinsicPercentageWidth > 100 && columnTotals.columnMinWidth < maxTableWidth) {
        console.log('assignIntrinsicBasedColumnWidths')
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

    console.log(columnsRecivingWidth, columnsRecivingWidthintrinsicPercentageTotal);

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

    console.log('widthToAddToEachColumn', widthToAddToEachColumn);

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

    tableData.forEach((row, i) => {
        const rowHeight = getRowHeight(tableData, columnDimensions, options);
        
        tableData[i] = {...tableData[i], rowHeight};
        currentTableHeight += rowHeight
    });

    return {tableData, currentTableHeight};
};

export function getRowHeight(tableData, columnWidths, options) { //TODO: Look over this. I amnot sure what is going on. Looks like you could just wrap the test and see how many lines per row there are.
    
    const rowdata = tableData.map(row => {
        const longestItem = Object.keys(row).reduce((longest, col) => {
            const wrappedText = row.tableRowType == 'row' ? 
                getWrapedText(this.cellFont, this.cellTextSize, columnWidths[col], row[col], this.additionalWrapCharacters) : 
                getWrapedText(this.subHeadingFont, this.subHeadingTextSize, columnWidths[col], row[col], this.additionalWrapCharacters) ; 
            return wrappedText.length > longest.length ? wrappedText : longest;
        }, []);

        //if(row.tableRowType !== 'row') console.log((row.tableRowType == 'row' ? this.cellLineHeight : this.subHeadingLineHeight))


        return {
            rowHeight: longestItem.length * (row.tableRowType == 'row' ? this.cellLineHeight : this.subHeadingLineHeight)
        };
    });
    
    return rowdata;
};

export function updateIntrinsicPercentageWidth(maxColumnLength, tableWidth) {
    return (maxColumnLength / tableWidth) * 100;
}

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
}