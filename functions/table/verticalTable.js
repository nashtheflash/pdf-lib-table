import { drawTableBoarder } from "./elements";
import { drawVerticalHeader } from "../header";
import { drawRows } from "../row";

export const drawVerticalTable = (tableProps) => {
    const { tableBoarder } = tableProps;

    //draw outline
    if(tableBoarder) drawTableBoarder(tableProps);

    //Header
    drawVerticalHeader(tableProps);

    //Rows
    drawRows(tableProps);
};