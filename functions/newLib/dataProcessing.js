import { calcColumnHeaderWidths } from "./headerData";
import { calcColumnWidths } from "./columnWidthStrtegies";

export function processData(data, columns, maxTableHeight, options) {
    const columnHeaderWidths = calcColumnHeaderWidths(columns, options);
    const [finalColumnDimensions, tableHeight, wrappedTableData, remainingData] = calcColumnWidths(data, columns, columnHeaderWidths, maxTableHeight, options);

    return [finalColumnDimensions, tableHeight, wrappedTableData, remainingData];
}
