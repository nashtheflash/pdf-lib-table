import { getTextWidth, getWrapedText } from "../lib";
import { getCellTextRowsByColumn, drawCellBackground, drawCellDividerX, drawCellDividerY, getCellY, getTextAlignment, drawCellText } from "./rowFunctions";

export const drawRows = ({
    page,
    data,
    columns,
    columnIds,
    alternateRowColor,
    alternateCellColor,
    //TABLE SETTINGS
    startingX,
    startingY,
    tableType,
    dividedX,
    dividedY,
    dividedXColor,
    dividedYColor,
    dividedXThickness,
    dividedYThickness,
    //CELL SETTINGS
    cellFont,
    cellBackgroundColor,
    cellTextSize,
    cellTextColor,
    //cellHeight,
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
    rowSectionStartingY
}) => {

    //Wording
    let horizontalCursor = 0; //horizontal Alignment I think about a cusor moving across the screen printing
    let currentRowHeight = 0; //measures the row height going down the page
    data.forEach((row, index) => {
        const rowLengths = Object.keys(row).map((key) =>  getWrapedText(cellFont, cellTextSize, columnWidths[key], row[key]).length);
        const rowStartingY = startingY - rowSectionStartingY - currentRowHeight;
        const rowRows = Math.max(...rowLengths); // this is the nummber of text rows in each row
        const rowHeight = rowRows * cellTextSize;
        
        //Cell Background color
        drawCellBackground({ page, index, startingX, rowStartingY, rowHeight, horizontalCursor, availableTableWidth, cellTextSize, alternateRowColor, alternateCellColor, cellBackgroundColor });

        //Cell divider Y must be turned on and it does not print for the last column
        if(dividedX && index != data.length - 1) drawCellDividerX({ page, startingX, rowStartingY, rowHeight, availableTableWidth, cellTextSize, dividedXThickness, dividedXColor });
        
        Object.keys(row).forEach((cell, i) => {
            const columnSettings = columns.find((column) => column.columnId == cell);            
            const cellText = getWrapedText(cellFont, cellTextSize, columnWidths[columnSettings.columnId], row[cell]);
            console.log(cellText)
            //If the item is a subheading then print subheading
            if(row[cell].sectionId) {
                drawSubHeading(row[cell]);
                return;
            };

            cellText.forEach((lineOfText, i) => {
                //get the line y cordinate within the cell
                const cellY = getCellY({ i, rowRows, cellRows: cellText.length, cellTextSize});
                //Text Alignment
                const alignment = getTextAlignment({ alignment: columnSettings.textAlignment, columnWidth: columnWidths[columnSettings.columnId], cellFont, cellTextSize, lineOfText });
                //Cell Text
                drawCellText({ page, startingX, rowStartingY, cellY, horizontalCursor, alignment, cellTextSize, cellFont, cellTextColor, cellTextSize, lineOfText });
            })
            horizontalCursor += columnWidths[columnSettings.columnId]; //Moves the corsor within the cell for text wraping;

            //Cell divider X must be turned on and it does not print for the last column
            if(dividedY && i != Object.keys(row).length - 1) drawCellDividerY({ page, startingX, rowStartingY, horizontalCursor, rowHeight, cellTextSize, dividedYThickness, dividedYColor});
        
        });
        horizontalCursor = 0;
        currentRowHeight += rowHeight;
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