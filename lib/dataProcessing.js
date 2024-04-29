import { calcColumnHeaderWidths } from "./headerDimensions";
import { calcColumnWidths } from "./columns";

export function processData(data, columns, maxTableHeight, options) {
    const columnHeaderWidths = calcColumnHeaderWidths(columns, options);
    const [finalColumnDimensions, tableHeight, wrappedTableData, remainingData] = calcColumnWidths(data, columns, columnHeaderWidths, maxTableHeight, options);

    return [finalColumnDimensions, tableHeight, wrappedTableData, remainingData];
}
