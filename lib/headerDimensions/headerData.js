import { getTextWidth, getLongestWordFromString, getWrapedText } from "../";
import { updateIntrinsicPercentageWidth } from "../columns";

export function calcColumnHeaderWidths(columns, options) {
    const { headerWrapText } = options;
    let columnDimensions;
    
    if(!headerWrapText) {
        columnDimensions = columnWidthNoWrap(columns, options);
    } else {
        columnDimensions = columnWidthWrap(columns, options);
    }

    return columnDimensions;
};

export function columnWidthNoWrap(columns, options) {
    const { headerTextSize, headerFont, maxTableWidth } = options;

    let columnDimensions;

    columns.forEach((col) => {
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, col.header);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: columnMinWidth,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(columnMinWidth, maxTableWidth),
        }};
    });

    return columnDimensions;

}

export function columnWidthWrap(columns, options) {
    const { headerTextSize, headerFont, maxTableWidth } = options;

    let columnDimensions;

    columns.forEach((col) => {
        const headerStringLength = getTextWidth(headerFont, headerTextSize, col.header+' '); //may need to adjust this at some point in the future
        const longestHeaderWord = getLongestWordFromString(col.header, options);
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, longestHeaderWord+' ');

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: headerStringLength,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(headerStringLength, maxTableWidth),
        }};
    });

    return columnDimensions;
}

export function wrapHeader({columns, columnDimensions, headerLineHeight, headerTextSize, headerFont, additionalWrapCharacters}) {
    const  wrappedHeaders = columns.map(({ columnId, header }) => {
        const wrappedText = getWrapedText(headerFont, headerTextSize, columnDimensions[columnId].actualWidth, header, additionalWrapCharacters);
        return { columnId: columnId, data: wrappedText, height: wrappedText.length * headerLineHeight }
    });

    return wrappedHeaders;
}
