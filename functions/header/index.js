import { getTextWidth } from "../lib";

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
    availableTableHeight,
    availableTableWidth,
}) => {
    
    //Header Background Color
    page.drawRectangle({
        x: startingX,
        y: startingY,
        width: availableTableWidth,
        height: headerHeight,
        borderWidth: 0,
        color: headerBackgroundColor,
        opacity: 0.25
    })

    //Wording
    let cursor = 0; //left Alignment 
    columns.forEach((column) => {
        //adjust alighnment
        let alignment = 0;
        if(headerTextAlignment === 'right') alignment = columnWidths[column.columnId] - getTextWidth(headerFont, headerTextSize, column.header);
        if(headerTextAlignment === 'center') alignment = (columnWidths[column.columnId] - getTextWidth(headerFont, headerTextSize, column.header)) / 2;
        
        //Header Text
        page.drawText(column.header, {
            x: startingX + cursor + alignment,
            y: startingY,
            size: headerTextSize,
            font: headerFont,
            color: headerTextColor
        });
        cursor += columnWidths[column.columnId];
        
        //Header Divider must be turned on and it does not print for the last column
        if(headerDividedY && columns[columns.length - 1] != column) {
            page.drawLine({
                start: { x: startingX + cursor, y: startingY },
                end: { x: startingX + cursor, y: startingY + headerHeight },
                thickness: 1,
                // color: rgb(0,1,0),
                opacity: 0.75,
            });
        }
    });
};

//TODO: CONTINUE BUILDING HEADING




























// export const drawHorizontalHeader = (columns) => {

// }

// export const draw2WayHeader = (columns) => {

// }