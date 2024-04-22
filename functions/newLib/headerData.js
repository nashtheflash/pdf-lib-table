import { getTextWidth, getLongestWordFromString, getWrapedText } from "./lib";
import { updateIntrinsicPercentageWidth } from "./columnWidthStrtegies";

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
        const headerStringLength = getTextWidth(headerFont, headerTextSize, col.header);
        const longestHeaderWord = getLongestWordFromString(col.header, options);
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, longestHeaderWord);

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

export function getParentColumnId(column, subHeadingDefs) {
    const def = subHeadingDefs.find(({columnId}) => columnId === column); 
    const col = def?.parentId ? def.parentId : '';
    console.log(subHeadingDefs, column, def, col)
   TODO PICKUP HERE. IDK WHY THIS IS UNDIFINED 
    return def?.parentId ? def.parentId : '';
}





