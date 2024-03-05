import { getTextWidth, getWrapedText } from "../lib";
import { getCellTextRowsByColumn } from "./rowFunctions";

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
    let vertialCursor = 0; //vertial Alignment I think about a cusor moving across the screen printing
    let currentRowHeight = 0; //measures the row height going down the page
    let LastTextRowHeight = 0; //measures the text height in a cell
    data.forEach((row, index) => {
        //finds the number of text rows per cell
        let rowLengths = {};
        Object.keys(row).forEach(function(key, index) {
            const cellText = getWrapedText(cellFont, cellTextSize, columnWidths[key], row[key]);
            console.log(cellText);
            rowLengths = {...rowLengths, [key]: cellText.length}
        });
        
        const rowStartingY = startingY - rowSectionStartingY - currentRowHeight;
        const rowRows = Math.max(...Object.values(rowLengths)) // this is the nummber of text rows in each row
        const rowHeight = rowRows * cellTextSize
        
        //Cell Background color
        page.drawRectangle({
            x: startingX + horizontalCursor,
            //y: startingY - vertialCursor - rowSectionStartingY,
            y: rowStartingY + cellTextSize - rowHeight,
            width: availableTableWidth,
            height: rowHeight,
            borderWidth: 0,
            color: index % 2 !== 0 &&  alternateRowColor ? alternateCellColor : cellBackgroundColor,
            opacity: 0.25
        })
        
        const dataColumn = Object.keys(row);
        dataColumn.forEach((cell) => {
            const cellData = row[cell];
            const columnSettings = columns.filter((column) => column.columnId == cell)[0]; //TODO: Convert to .find()
            
            const cellText = getWrapedText(cellFont, cellTextSize, columnWidths[columnSettings.columnId], cellData);
            const cellRows = cellText.length;

            
            //If the item is a subheading then print subheading
            if(cellData.sectionId) {
                drawSubHeading(cellData);
                return;
            };

            vertialCursor = ((rowRows - cellText.length) * cellTextSize) + currentRowHeight; //sets cursor to the bottom of the cell
            cellText.forEach((lineOfText, i) => {
                const cellRow = cellRows - i; //what line is printing
                
                let cellY = 0;
                if(cellRow === rowRows && cellRows !== 1) {
                    cellY = 0;
                } else if(cellRows === 1) {
                    cellY = (rowRows - 1) * cellTextSize;
                } else if(cellRow < rowRows && rowRows !== cellRows) {
                    cellY = (cellRow - (cellRow - i)) * cellTextSize + cellTextSize;
                } else if(cellRow < rowRows) {
                    cellY = (cellRow - (cellRow - i)) * cellTextSize;
                };

                //Text Alignment
                let alignment = 0;
                // if(!columnSettings.textAlignment || columnSettings.textAlignment === 'left') alignment = columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, lineOfText);
                // if(columnSettings.textAlignment === 'right') alignment = columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, lineOfText);
                // if(columnSettings.textAlignment === 'center') alignment = (columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, lineOfText)) / 2;
                
                //Cell Text
                page.drawText(lineOfText, {
                    x: startingX + horizontalCursor,
                    y: rowStartingY - cellY,
                    size: cellTextSize,
                    font: cellFont,
                    color: cellTextColor,
                    lineHeight: cellTextSize
                });
            })
            horizontalCursor += columnWidths[columnSettings.columnId]; //Moves the corsor within the cell for text wraping;
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