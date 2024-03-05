import { getTextWidth, getWrapedText } from "../lib";
import { getHeaderRows, getHeaderTextRowsByColumn } from "./headerFuncitons";

export const drawVerticalHeader = ({ 
    page, 
    columns,
    columnWidths, 
    startingX, 
    startingY, 
    headerFont, 
    headerTextSize, 
    headerTextColor, 
    headerHeight,
    headerBackgroundColor,
    headerTextAlignment,
    headerDividedY,
    headerDividedX,
    headerDividedXColor,
    headerDividedYColor,
    headerDividedXThickness,
    headerDividedYThickness,
    availableTableWidth,
    headerWrapText,
    headerTextRows,
    headerFullTextHeight
}) => {
    const headerTextRowsByColumn = getHeaderTextRowsByColumn({ headerWrapText, columns, headerFont, headerTextSize, columnWidths });
    const longestHeaderRows = Math.max(...Object.values(headerTextRowsByColumn));
    
    //Header Background Color
    page.drawRectangle({
        x: startingX,
        y: startingY - Math.max(headerHeight, headerFullTextHeight),
        width: availableTableWidth,
        height: Math.max(headerHeight, headerFullTextHeight),
        borderWidth: 0,
        color: headerBackgroundColor,
        opacity: 0.25
    });

    //Header X Divider
    if(headerDividedX) {
        page.drawLine({
            start: { x: startingX, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
            end: { x: startingX + availableTableWidth, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
            thickness: headerDividedXThickness,
            color: headerDividedXColor,
            opacity: 1,
        });
    };

    //Wording
    let horizontalCursor = 0; //horizontal Alignment I think about a cusor moving across the screen printing
    let vertialCursor = 0; //vertial Alignment I think about a cusor moving across the screen printing
    columns.forEach((column) => {
        //array of lines that need to be printed
        const headerText = getWrapedText(headerFont, headerTextSize, columnWidths[column.columnId], column.header);
        
        vertialCursor = (longestHeaderRows - headerText.length) * headerTextSize;
        headerText.forEach((lineOfText) => {
            let alignment = 0;
            if(headerTextAlignment === 'right') alignment = columnWidths[column.columnId] - getTextWidth(headerFont, headerTextSize, lineOfText);
            if(headerTextAlignment === 'center') alignment = (columnWidths[column.columnId] - getTextWidth(headerFont, headerTextSize, lineOfText)) / 2;
            //Header Text
            page.drawText(lineOfText, {
                x: startingX + horizontalCursor + alignment,
                y: startingY - vertialCursor - headerTextSize,
                size: headerTextSize,
                font: headerFont,
                color: headerTextColor,
                lineHeight: headerTextSize
            });
            vertialCursor += headerTextSize;
        })

        horizontalCursor += columnWidths[column.columnId];
        
        //Header Divider must be turned on and it does not print for the last column
        if(headerDividedY && columns[columns.length - 1] != column) {
            page.drawLine({
                start: { x: startingX + horizontalCursor, y: startingY },
                end: { x: startingX + horizontalCursor, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
                thickness: headerDividedYThickness,
                color: headerDividedYColor,
                opacity: 0.75,
            });
        };

        vertialCursor = 0;
    });
};


export const drawHorizontalHeader = ({ 
    page, 
    columns,
    columnWidths, 
    startingX, 
    startingY, 
    headerFont, 
    headerTextSize, 
    headerTextColor, 
    headerHeight,
    headerBackgroundColor,
    headerTextAlignment,
    headerDividedY,
    headerDividedX,
    headerDividedXColor,
    headerDividedYColor,
    headerDividedXThickness,
    headerDividedYThickness,
    availableTableWidth,
    headerWrapText,
    headerTextRows,
    headerFullTextHeight
}) => {
    const headerTextRowsByColumn = getHeaderTextRowsByColumn({ headerWrapText, columns, headerFont, headerTextSize, columnWidths });
    const longestHeaderRows = Math.max(...Object.values(headerTextRowsByColumn));
    
    //Header Background Color
    page.drawRectangle({
        x: startingX,
        y: startingY - Math.max(headerHeight, headerFullTextHeight),
        width: availableTableWidth,
        height: Math.max(headerHeight, headerFullTextHeight),
        borderWidth: 0,
        color: headerBackgroundColor,
        opacity: 0.25
    });

    //Header X Divider
    if(headerDividedX) {
        page.drawLine({
            start: { x: startingX, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
            end: { x: startingX + availableTableWidth, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
            thickness: headerDividedXThickness,
            color: headerDividedXColor,
            opacity: 1,
        });
    };

    //Wording
    let horizontalCursor = 0; //horizontal Alignment I think about a cusor moving across the screen printing
    let vertialCursor = 0; //vertial Alignment I think about a cusor moving across the screen printing
    columns.forEach((column) => {
        //array of lines that need to be printed
        const headerText = getWrapedText(headerFont, headerTextSize, columnWidths[column.columnId], column.header);
        
        vertialCursor = (longestHeaderRows - headerText.length) * headerTextSize;
        headerText.forEach((lineOfText) => {
            let alignment = 0;
            if(headerTextAlignment === 'right') alignment = columnWidths[column.columnId] - getTextWidth(headerFont, headerTextSize, lineOfText);
            if(headerTextAlignment === 'center') alignment = (columnWidths[column.columnId] - getTextWidth(headerFont, headerTextSize, lineOfText)) / 2;
            //Header Text
            page.drawText(lineOfText, {
                x: startingX + horizontalCursor + alignment,
                y: startingY - vertialCursor - headerTextSize,
                size: headerTextSize,
                font: headerFont,
                color: headerTextColor,
                lineHeight: headerTextSize
            });
            vertialCursor += headerTextSize;
        })

        horizontalCursor += columnWidths[column.columnId];
        
        //Header Divider must be turned on and it does not print for the last column
        if(headerDividedY && columns[columns.length - 1] != column) {
            page.drawLine({
                start: { x: startingX + horizontalCursor, y: startingY },
                end: { x: startingX + horizontalCursor, y: startingY - Math.max(headerHeight, headerFullTextHeight) },
                thickness: headerDividedYThickness,
                color: headerDividedYColor,
                opacity: 0.75,
            });
        };

        vertialCursor = 0;
    });
};