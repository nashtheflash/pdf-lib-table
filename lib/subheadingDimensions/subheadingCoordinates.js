import { getParentColumnId } from "../headerDimensions";

export function getSubheadingStartingX(columnDimension, columnId, subHeadingColumns ) {
    const parentId = getParentColumnId(columnId, subHeadingColumns);
    if(!parentId) return;
    const columnMeasurments = columnDimension[parentId];

    return columnMeasurments.startingX
}
