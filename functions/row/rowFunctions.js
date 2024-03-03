import { getWrapedText } from "../lib";


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