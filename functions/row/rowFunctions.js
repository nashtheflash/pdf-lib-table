import { getWrapedText, getTextWidth } from "../lib";


export const getTotalRowHeight = (data, cellFont, cellHeight, cellTextSize, columnWidths) => {
    
    const height = data.map((row) => {
        let rowHeight = [];
        Object.keys(row).forEach(function(key, index) {
            const cellText = getWrapedText(cellFont, cellTextSize, columnWidths[key], row[key]);
            rowHeight.push(cellText.length);
        });
        return rowHeight
    })
    const maxHeight = height.map((row) => Math.max(...row))
    const totalRowHeight = maxHeight.map((row) => cellHeight + ((row - 1) * cellTextSize) )
    
    
    const sumRowHeights = totalRowHeight.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
    );
    
    return sumRowHeights;
};

export const drawCellBackground = ({ page, index, startingX, rowStartingY, rowHeight, horizontalCursor, availableTableWidth, cellTextSize, alternateRowColor, alternateCellColor, cellBackgroundColor }) => {
    page.drawRectangle({
        x: startingX + horizontalCursor,
        y: rowStartingY + cellTextSize - rowHeight,
        width: availableTableWidth,
        height: rowHeight,
        borderWidth: 0,
        color: index % 2 !== 0 &&  alternateRowColor ? alternateCellColor : cellBackgroundColor,
        opacity: 0.25
    });
}


export const drawCellDividerX = ({ page, startingX, rowStartingY, rowHeight, availableTableWidth, cellTextSize, dividedXThickness, dividedXColor }) => {
    page.drawLine({
        start: { x: startingX, y: rowStartingY + cellTextSize - rowHeight},
        end: { x: startingX + availableTableWidth, y: rowStartingY + cellTextSize - rowHeight },
        thickness: dividedXThickness,
        color: dividedXColor,
        opacity: 1,
    });
}


export const drawCellDividerY = ({ page, startingX, rowStartingY, rowHeight, horizontalCursor, cellTextSize, dividedYThickness, dividedYColor }) => {
    page.drawLine({
        start: { x: startingX + horizontalCursor, y: rowStartingY + cellTextSize },
        end: { x: startingX + horizontalCursor, y: rowStartingY + cellTextSize - rowHeight },
        thickness: dividedYThickness,
        color: dividedYColor,
        opacity: 1,
    });
}

export const drawCellText = ({ page, startingX, rowStartingY, cellY, horizontalCursor, alignment, cellTextSize, cellFont, cellTextColor, lineOfText }) => {
    page.drawText(lineOfText, {
        x: startingX + horizontalCursor + alignment,
        y: rowStartingY - cellY,
        size: cellTextSize,
        font: cellFont,
        color: cellTextColor,
        lineHeight: cellTextSize
    });
}

export const getCellY = ({ i, rowRows, cellRows, cellTextSize }) => {
    const cellRow = cellRows - i; //what line is printing
    // console.log('i: ', i, ' rowRows: ', rowRows, ' cellRows: ', cellRows, ' cellTextSize: ', cellTextSize, ' cellRow: ', cellRow);
    if(cellRow === rowRows && cellRows !== 1) {
        return 0;
    } else if(cellRows === 1) {
        return (rowRows - 1) * cellTextSize;
    } else if(cellRow < rowRows && rowRows !== cellRows) {
        return (rowRows - cellRow) * cellTextSize;
    } else if(cellRow < rowRows) {
        return (cellRow - (cellRow - i)) * cellTextSize;
    };
}


export const getTextAlignment = ({ alignment, columnWidth, cellFont, cellTextSize, lineOfText }) => {
    if(!alignment || alignment === 'left') return 0
    if(alignment === 'right') return columnWidth - getTextWidth(cellFont, cellTextSize, lineOfText);
    if(alignment === 'center') return (columnWidth - getTextWidth(cellFont, cellTextSize, lineOfText)) / 2;
}