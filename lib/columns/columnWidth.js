import { getTextWidth, getLongestWordFromString, getParentColumnId, getChildColumnId } from "../";
import { updateIntrinsicPercentageWidth } from "./helpers";
import { distributeExcessTableWidth } from "./widthDistributionStrtegies";
import { getTableHeight } from "../tableDimensions";

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
        
        const finalColumnDimensions = adjustColumnWidth({ rowData: data[loop], rowType: data[loop].type, columnDimensions, currentInternalTableDimensions, maxTableHeight, columns, options });    
        const prevWrapedData = currentInternalTableDimensions ? currentInternalTableDimensions[2] : {}
        const [tableHeight, wrappedTableData] = getTableHeight({ rowData: data[loop], tableData, columnDimensions, finalColumnDimensions, prevWrapedData, columns, options })
        
        if(tableHeight < maxTableHeight) {
            currentInternalTableDimensions = [finalColumnDimensions, tableData, wrappedTableData]
            columnDimensions = finalColumnDimensions;
            finalTableHeight = tableHeight;
        }

        if(tableHeight >= maxTableHeight) {
            tableData.pop()
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

export function adjustColumnWidth({ rowData, rowType, columnDimensions, options }){
    const { cellFont, cellTextSize, subHeadingFont, subHeadingTextSize, maxTableWidth, subHeadingWrapText, subHeadingColumns } = options; 
    
    let adjustedColumnDimensions = columnDimensions
    const cols = Object.keys(adjustedColumnDimensions)

    for (let loop = 0; loop < cols.length; loop++) {           
        if(rowType === 'subheading' && !subHeadingWrapText) return;

        let font = cellFont;
        let textSize = cellTextSize;
        let columnDataId = cols[loop];
        let text = rowData.data[columnDataId];

        if( rowType === 'subheading' ) {
            const childColumnId = getChildColumnId(cols[loop], subHeadingColumns);
            columnDataId = false;
            if(childColumnId) {
                font = subHeadingFont;
                textSize = subHeadingTextSize;
                columnDataId = getParentColumnId(childColumnId, subHeadingColumns)
                text = rowData.data[childColumnId];
            }
        }

        if(!columnDataId) continue;

        const cellStringLength = getTextWidth(font, textSize, text+' ');
        const longestCellWord = getLongestWordFromString(text, options);
        const cellMinWidth = getTextWidth(font, textSize, longestCellWord+' ');
        
        if(adjustedColumnDimensions[columnDataId].columnMinWidth < cellMinWidth && text != '') adjustedColumnDimensions[columnDataId].columnMinWidth = cellMinWidth;
        if(adjustedColumnDimensions[columnDataId].maxColumnWidth < cellStringLength) adjustedColumnDimensions[columnDataId].maxColumnWidth = cellStringLength;
        adjustedColumnDimensions[columnDataId].intrinsicPercentageWidth = updateIntrinsicPercentageWidth(adjustedColumnDimensions[columnDataId].maxColumnWidth, maxTableWidth);
    };
    
    //Find the actual column widths
    const finalColumnDimensions = distributeExcessTableWidth(adjustedColumnDimensions, options);
    

    return finalColumnDimensions //adjust this...
};
