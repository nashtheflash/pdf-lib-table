import { drawTableBoarder } from "./elements";
import { drawHorizontalHeader } from "../header";
import { drawRows } from "../row";

export const drawVerticalTable = (tableProps) => {
    const { tableBoarder } = tableProps;
    //draw outline
    if(tableBoarder) drawTableBoarder(tableProps);
    //Header
    drawHorizontalHeader(tableProps);
    //Rows
    drawRows(tableProps);
};