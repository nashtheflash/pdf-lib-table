import { getTextWidth, getLongestWordFromString, sumColumnProperties, fileterObject } from "./lib";
import { getTableHeight } from "./tableData";

export function calcColumnWidths(data, columnHeaderWidths, maxTableHeight, options) {
    const { startingX } = options;
    
    //most of these are optomizations
    let columnDimensions = columnHeaderWidths;
    let tableData = [];
    let currentInternalTableDimensions;
    let finalTableHeight;
    const  dataLength = data.length;
    for (let loop = 0; loop < dataLength; loop++){
        tableData.push(data[loop])
        
        const finalColumnDimensions = adjustColumnWidth({ rowData: data[loop], rowType: data[loop].type, tableData, columnDimensions, currentInternalTableDimensions, maxTableHeight, options }); //TODO: this needs to just run the calc on one row. then check to see if the data needs to be updated
        const prevWrapedData = currentInternalTableDimensions ? currentInternalTableDimensions[2] : {}
        const [tableHeight, wrappedTableData] = getTableHeight({ rowData: data[loop], tableData, columnDimensions, finalColumnDimensions, prevWrapedData, options })
       
        // console.log(tableHeight, maxTableHeight)
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
    console.log('CCW', wrappedTableData);

    //adding the starting x for each column
    let startingXCounter = startingX;
    Object.keys(finalColumnDimensions).forEach((col) => {
        finalColumnDimensions = {...finalColumnDimensions, [col]: {...finalColumnDimensions[col], startingX: startingXCounter}};
        
        startingXCounter += finalColumnDimensions[col].actualWidth;
    })

    return [finalColumnDimensions, finalTableHeight, wrappedTableData, remainingData];
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
    }
};

export function adjustColumnWidth({ rowData, rowType, tableData, columnDimensions, currentInternalTableDimensions, options }){
    const { cellFont, cellTextSize, maxTableWidth, startingY, subHeadingWrapText, subheadingColumns } = options;
    let adjustedColumnDimensions = columnDimensions
    
    Object.keys(adjustedColumnDimensions).forEach((col) => {
        if(rowType === 'subheading' && !subHeadingWrapText) return;
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

export function updateIntrinsicPercentageWidth(maxColumnLength, tableWidth) {
    return (maxColumnLength / tableWidth) * 100;
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
