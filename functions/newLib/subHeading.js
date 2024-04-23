import { getParentColumnId } from "./headerData";

export function getSubheadingStartingX(columnDimension, columnId, subHeadingColumns ) {
    const parentId = getParentColumnId(columnId, subHeadingColumns);
    if(!parentId) return;
    const columnMeasurments = columnDimension[parentId];

    console.log(columnMeasurments, parentId);
    return columnMeasurments.startingX
}
