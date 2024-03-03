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
    data.forEach((row, index) => {
        
        //finds the number of text rows per cell
        let rowLengths = {};
        Object.keys(row).forEach(function(key, index) {
            const cellText = getWrapedText(cellFont, cellTextSize, columnWidths[key], row[key]);
            rowLengths = {...rowLengths, [key]: cellText.length}
        });
        const mostRows = Math.max(...Object.values(rowLengths))
        // console.log(mostRows);
       
        
        //Cell Background color
        page.drawRectangle({
            x: startingX + horizontalCursor,
            y: startingY - vertialCursor - rowStartingY,
            width: availableTableWidth,
            height:cellHeight,
            borderWidth: 0,
            color: index % 2 !== 0 &&  alternateRowColor ? alternateCellColor : cellBackgroundColor,
            opacity: 0.25
        })
        
        const dataColumn = Object.keys(row);
        let LastRowHeight;
        dataColumn.forEach((cell) => {
            const cellData = row[cell];
            const columnSettings = columns.filter((column) => column.columnId == cell)[0]; //TODO: Convert to .find()

            const cellText = getWrapedText(cellFont, cellTextSize, columnWidths[columnSettings.columnId], cellData);
            //console.log('cellText: ',cellText.length);

            //If the item is a subheading then print subheading
            if(cellData.sectionId) {
                drawSubHeading(cellData);
                return;
            };

            // vertialCursor = 0;
            cellText.forEach((lineOfText) => {
                // vertialCursor = (mostRows - cellText.length) * cellTextSize;
                //Text Alignment
                let alignment = 0;
                if(!columnSettings.textAlignment || columnSettings.textAlignment === 'left') alignment = columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, lineOfText);
                if(columnSettings.textAlignment === 'right') alignment = columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, lineOfText);
                if(columnSettings.textAlignment === 'center') alignment = (columnWidths[columnSettings.columnId] - getTextWidth(cellFont, cellTextSize, lineOfText)) / 2;
                
                //Cell Text
                page.drawText(lineOfText, {
                    x: startingX + horizontalCursor,
                    y: startingY - vertialCursor - rowStartingY,
                    size: cellTextSize,
                    font: cellFont,
                    color: cellTextColor,
                    lineHeight: cellHeight
                });
                vertialCursor += cellHeight * (cellText.length - 1); //Moves the corsor within the cell for text wraping;
            })
            LastRowHeight = cellHeight * (cellText.length - 1);
            horizontalCursor += columnWidths[columnSettings.columnId]; //Moves the corsor within the cell for text wraping;
        });
        vertialCursor = (cellHeight * (index + 1)) + LastRowHeight; //moves the cursor to the next row
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