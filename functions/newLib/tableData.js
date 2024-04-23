import { getWrapedText } from "./lib";

export function getTableHeight({ rowData, tableData, columnDimensions, finalColumnDimensions, prevWrapedData, options }) {
    // console.log('GTH', prevWrapedData);
    //if the data is unchanged. dont run calcRowHeights
    let wrappedTableData;

    if(JSON.stringify(finalColumnDimensions) === JSON.stringify(columnDimensions)){
        //only calc new row
        const wrappedTbleData = calcRowHeights([rowData], finalColumnDimensions, options);
        wrappedTableData = [...prevWrapedData, ...wrappedTbleData ];
    } else {
        //calc entire table
        const wrappedTbleData = calcRowHeights(tableData, finalColumnDimensions, options);
        // console.log(wrappedTbleData);
        wrappedTableData = wrappedTbleData;
    }
    // console.log(wrappedTableData)
    const tableHeight = wrappedTableData.reduce(( acc, val) => acc + val.rowHeight, 0)
    return [tableHeight, wrappedTableData]
};

export function calcRowHeights(data, columnDimensions, options){
    let tableData = [...data];
    // let currentTableHeight = 0;
    
    tableData.forEach((row, i) => {
        const [rowHeight, wrappedData] = getRowHeightAndWrapText(row, columnDimensions, options);
        tableData[i] = {...tableData[i], rowHeight, data: wrappedData};
    });
    
    return tableData
};

export function getRowHeightAndWrapText(row, columnWidths, options) {
    const { cellFont, cellTextSize, cellLineHeight, subHeadingWrapText, subHeadingFont, subHeadingLineHeight, subHeadingTextSize, subheadingColumns, additionalWrapCharacters } = options;
    // console.log('GRHAWT', cellTextSize, cellLineHeight, subHeadingWrapText);

    let tallestCell = 0;
    let wrappedData = {...row.data};
    Object.keys(row.data).forEach(cell => {
        console.log('look', columnWidths, cell, columnWidths[cell], columnWidths); 
        if(row.type === 'row') {
            const wrappedText = getWrapedText(cellFont, cellTextSize, columnWidths[cell].actualWidth, row.data[cell], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [cell]: wrappedText}
            // console.log(wrappedData);
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };

        // if(row.type === 'subheading' && subHeadingWrapText) {
        if(row.type === 'subheading') {
            // console.log(row, subheadingColumns, cell);
            const subheadingDef = subheadingColumns.find(({columnId}) => columnId === cell);
            const parentColumnId = subheadingDef.parentId;
            const subHeadingColumnId = subheadingDef.columnId;
            const wrappedText = getWrapedText(subHeadingFont, subHeadingTextSize, columnWidths[parentColumnId].actualWidth, row.data[subHeadingColumnId], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [parentColumnId]: wrappedText}
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };
        if(row.type === 'subheading' && !subHeadingWrapText) {
            tallestCell = 1; // if there is no wrapping the array length will only ever be 1
        };
    });
    
    const rowHeight = row.type === 'row' ? tallestCell * cellLineHeight : tallestCell * subHeadingLineHeight;
    // console.log('wd', wrappedData);

    return [rowHeight, wrappedData]; //TODO: THIS IS THE FINAL DATA THAT I NEED!!!!!!!!
};
