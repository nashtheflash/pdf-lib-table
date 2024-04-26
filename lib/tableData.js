import { getWrapedText } from ".";
import { getChildColumnId } from "./headerData";

export function getTableHeight({ rowData, tableData, columnDimensions, finalColumnDimensions, prevWrapedData, columns, options }) {
    //if the data is unchanged. dont run calcRowHeights
    let wrappedTableData;

    if(JSON.stringify(finalColumnDimensions) === JSON.stringify(columnDimensions)){
        //only calc new row
        console.log('row calc')
        const wrappedTbleData = calcRowHeights(columns, [rowData], finalColumnDimensions, options);
        wrappedTableData = [...prevWrapedData, ...wrappedTbleData ];
    } else {
        //calc entire table
        console.log('table calc')
        const wrappedTbleData = calcRowHeights(columns, tableData, finalColumnDimensions, options);
        wrappedTableData = wrappedTbleData;
    }
    const tableHeight = wrappedTableData.reduce(( acc, val) => acc + val.rowHeight, 0)
    return [tableHeight, wrappedTableData]
};

export function calcRowHeights(columns, data, columnDimensions, options){
    let tableData = [...data];
   
    tableData.forEach((row, i) => {
        const [rowHeight, wrappedData] = getRowHeightAndWrapText(row, columnDimensions, columns, options);
        tableData[i] = {...tableData[i], rowHeight, data: wrappedData};
    });
    
    return tableData
};

export function getRowHeightAndWrapText(row, columnWidths, columns, options) {
    const { cellFont, cellTextSize, cellLineHeight, subHeadingWrapText, subHeadingFont, subHeadingLineHeight, subHeadingTextSize, subHeadingColumns, additionalWrapCharacters } = options;
    let tallestCell = 0;
    let wrappedData = {...row.data};

    columns.forEach(({columnId}) => {
        if(row.type === 'row') {
            const wrappedText = getWrapedText(cellFont, cellTextSize, columnWidths[columnId].actualWidth, row.data[columnId], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [columnId]: wrappedText}
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };

        if(row.type === 'subheading' && subHeadingWrapText) {
            const subHeadingColumnId = getChildColumnId(columnId, subHeadingColumns);
            if(!subHeadingColumnId) return;

            const wrappedText = getWrapedText(subHeadingFont, subHeadingTextSize, columnWidths[columnId].actualWidth, row.data[subHeadingColumnId], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [columnId]: wrappedText}
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };
        if(row.type === 'subheading' && !subHeadingWrapText) {
            tallestCell = 1; // if there is no wrapping the array length will only ever be 1
        };
    });
    
    const rowHeight = row.type === 'row' ? tallestCell * cellLineHeight : tallestCell * subHeadingLineHeight;

    return [rowHeight, wrappedData]; //TODO: THIS IS THE FINAL DATA THAT I NEED!!!!!!!!
};
