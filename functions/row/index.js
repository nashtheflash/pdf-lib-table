import { getTextWidth } from "../lib";

export const drawRows = ({
    page,
    data,
    columns,
    columnIds,
    //TABLE SETTINGS
    startingX,
    startingY,
    tableType,
    dividedX,
    dividedY,
    //CELL SETTINGS
    cellFont,
    cellBackgroundColor,
    cellTextSize,
    cellTextColor,
    cellHeight,
    //DERIVED
    pageHeight,
    pageWidth,
    numberOfRows,
    numberOfSubHeadings,
    availableTableWidth,
    availableTableHeight,
    headerLengths,
    longestRowItem,
    manualColumnWidths,
    columnWidths,
    headerHeight,
    headerTextRows,
    headerFullTextHeight,
    rowStartingY
}) => {
    
    //Wording
    let horizontalCursor = 0; //horizontal Alignment I think about a cusor moving across the screen printing
    let vertialCursor = 0; //vertial Alignment I think about a cusor moving across the screen printing
    data.forEach((row) => {
        //array of lines that need to be printed
        //const headerText = getWrapedText(headerFont, headerTextSize, columnWidths[column.columnId], column.header);
        //vertialCursor = (longestHeaderRows - headerText.length) * headerTextSize;
        
        const dataColumn = Object.keys(row);
        dataColumn.forEach((cell) => {
            const cellData = row[cell];
            console.log(cellData)
            const columnSettings = columns.filter((column) => column.columnId == cell)[0];

            //If the item is a subheading then print subheading
            if(cellData.sectionId) {
                drawSubHeading(cellData);
                return;
            };

            //Text Alignment
            let alignment = 0;
            if(!columnSettings.textAlignment || columnSettings.textAlignment === 'left') alignment = columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, cellData);
            if(columnSettings.textAlignment === 'right') alignment = columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, cellData);
            if(columnSettings.textAlignment === 'center') alignment = (columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, cellData)) / 2;
            
            //Cell Text
            page.drawText(cellData, {
                x: startingX + horizontalCursor,
                y: startingY - vertialCursor - rowStartingY,
                size: cellTextSize,
                font: cellFont,
                color: cellTextColor,
                lineHeight: cellHeight
            });
            //console.log(vertialCursor, cellHeight);
            // console.log(horizontalCursor, columnWidths[columnSettings.columnId]);
            horizontalCursor += columnWidths[columnSettings.columnId];
        })
        vertialCursor += cellHeight;
        horizontalCursor = 0;
        
        //Colum Divider must be turned on and it does not print for the last column
        // if(headerDividedY && columns[columns.length - 1] != column) {
        //     page.drawLine({
        //         start: { x: startingX + horizontalCursor, y: startingY },
        //         end: { x: startingX + horizontalCursor, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
        //         thickness: headerDividedYThickness,
        //         color: headerDividedYColor,
        //         opacity: 0.75,
        //     });
        // };

        // vertialCursor = 0;
    });



};


export const drawSubHeading = ({
    sectionLabel
    // page,
    // columns,
    // columnIds,
    // //TABLE SETTINGS
    // startingX,
    // startingY,
    // tableType,
    // dividedX,
    // dividedY,
    // //SUB HEADINGS
    // subHeadingBackgroundColor,
    // subHeadingHeight,
    // subHeadingFont,
    // subHeadingTextColor,
    // subHeadingTextSize,
    // //DERIVED
    // pageHeight,
    // pageWidth,
    // numberOfRows,
    // numberOfSubHeadings,
    // availableTableWidth,
    // availableTableHeight,
    // headerLengths,
    // longestRowItem,
    // manualColumnWidths,
    // columnWidths,
}
) => {

    console.log('PRINTING SECTION: ', sectionLabel)

};