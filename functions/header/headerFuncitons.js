import { getWrapedText } from "../lib";

//could maby be replaces with import { breakTextIntoLines } from "pdf-lib"; for mor acuracy
export const getHeaderRows = ({ headerWrapText, columns, headerFont, headerTextSize, columnWidths }) => {
    //if there is no text wraping then it will only be one row
    if(!headerWrapText) return 1;
    
    //finiding heading witht he most rows
    const headerLines = columns.map((column) => {
        return getWrapedText(headerFont, headerTextSize, columnWidths[column.columnId], column.header).length
    });

    const headerTextRows = Math.max(...headerLines);

    if(headerTextRows === 0) return 1
    if(headerTextRows > 0) return headerTextRows
};

export const getHeaderTextRowsByColumn = ({ headerWrapText, columns, headerFont, headerTextSize, columnWidths }) => {
    let columnLines = {};

    columns.forEach((column) => {
        const rows = getWrapedText(headerFont, headerTextSize, columnWidths[column.columnId], column.header).length
        // console.log(rows);
        const rowsActual = rows === 0 ? 1 : rows;
        // console.log(rows);
        columnLines = {...columnLines, [column.columnId]: rowsActual}
    });

    return columnLines;
}