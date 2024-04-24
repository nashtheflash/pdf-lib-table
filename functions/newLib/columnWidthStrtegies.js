import { getTextWidth, getLongestWordFromString, sumColumnProperties, fileterObject } from "./lib";
import { getTableHeight } from "./tableData";
import { getParentColumnId, getChildColumnId } from "./headerData";

export function calcColumnWidths(data, columns, columnHeaderWidths, maxTableHeight, options) {
    const { startingX } = options;
    
    //most of these are optomizations
    let columnDimensions = columnHeaderWidths;
    let tableData = [];
    let currentInternalTableDimensions;
    let finalTableHeight;
    const  dataLength = data.length;

    for (let loop = 0; loop < dataLength; loop++){
        tableData.push(data[loop])
        
        const finalColumnDimensions = adjustColumnWidth({ rowData: data[loop], rowType: data[loop].type, tableData, columnDimensions, currentInternalTableDimensions, maxTableHeight, columns, options }); //TODO: this needs to just run the calc on one row. then check to see if the data needs to be updated
    
        const prevWrapedData = currentInternalTableDimensions ? currentInternalTableDimensions[2] : {}
        const [tableHeight, wrappedTableData] = getTableHeight({ rowData: data[loop], tableData, columnDimensions, finalColumnDimensions, prevWrapedData, columns, options })
       
        if(tableHeight < maxTableHeight) {
            currentInternalTableDimensions = [finalColumnDimensions, tableData, wrappedTableData]
            columnDimensions = finalColumnDimensions;
            finalTableHeight = tableHeight;
        }

        if(tableHeight > maxTableHeight) {
            tableData.pop();
            break;
        }

        if(tableHeight < maxTableHeight && loop == data.length - 1) {
            break;
        }
    };


    const remainingData = data.slice(tableData.length);
    let [finalColumnDimensions, tableHeight, wrappedTableData] = currentInternalTableDimensions;

    //adding the starting x for each column
    let startingXCounter = startingX;
    Object.keys(finalColumnDimensions).forEach((col) => {
        finalColumnDimensions = {...finalColumnDimensions, [col]: {...finalColumnDimensions[col], startingX: startingXCounter}};
        
        startingXCounter += finalColumnDimensions[col].actualWidth;
    })

    return [finalColumnDimensions, finalTableHeight, wrappedTableData, remainingData];
};

export function adjustColumnWidth({ rowData, rowType, tableData, columnDimensions, currentInternalTableDimensions, columns, options }){
    const { cellFont, cellTextSize, subHeadingFont, subHeadingTextSize, maxTableWidth, startingY, subHeadingWrapText, subheadingColumns } = options; 
    
    let adjustedColumnDimensions = columnDimensions
    const cols = Object.keys(adjustedColumnDimensions)

    for (let loop = 0; loop < cols.length; loop++) {           
        if(rowType === 'subheading' && !subHeadingWrapText) return;

        let font = cellFont;
        let textSize = cellTextSize;
        let columnDataId = cols[loop];
        let text = rowData.data[columnDataId];

        if( rowType === 'subheading' ) {
            const childColumnId = getChildColumnId(col, subheadingColumns);
            columnDataId = false;
            if(childColumnId) {
                font = subHeadingFont;
                textSize = subHeadingTextSize;
                columnDataId = getParentColumnId(childColumnId, subheadingColumns)
                text = rowData.data[childColumnId];
            }
        }

        if(!columnDataId) continue;

        const cellStringLength = getTextWidth(font, textSize, text);
        const longestCellWord = getLongestWordFromString(text, options);
        const cellMinWidth = getTextWidth(font, textSize, longestCellWord);
        
        if(adjustedColumnDimensions[columnDataId].columnMinWidth < cellMinWidth && text != '') adjustedColumnDimensions[columnDataId].columnMinWidth = cellMinWidth;
        if(adjustedColumnDimensions[columnDataId].maxColumnWidth < cellStringLength) adjustedColumnDimensions[columnDataId].maxColumnWidth = cellStringLength;
        adjustedColumnDimensions[columnDataId].intrinsicPercentageWidth = updateIntrinsicPercentageWidth(adjustedColumnDimensions[columnDataId].maxColumnWidth, maxTableWidth);
    };
    
    //Find the actual column widths
    const finalColumnDimensions = distributeExcessTableWidth(tableData, adjustedColumnDimensions, options);
    

    return finalColumnDimensions //adjust this...
};

export function updateIntrinsicPercentageWidth(maxColumnLength, tableWidth) {
    return (maxColumnLength / tableWidth) * 100;
};

export function distributeExcessTableWidth(data, columnDimensions, options){ // more options could be added here
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
        throw new Error(`Table Overflow!! minTableWidth: ${columnTotals.columnMinWidth} maxTableWidth: ${maxTableWidth}`);
    }
};


export function assignIntrinsicBasedColumnWidths(columnDimensions, maxTableWidth, columnTotals) {
    //the measurment will start at the min width then then distrubute excess based on the intrinsicPercentageWidth
    let actialWidth = {};

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
