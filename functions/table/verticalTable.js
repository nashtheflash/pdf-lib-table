import { drawTableBoarder } from "./elements";
import { drawVerticalHeader } from "../header";

export const drawVerticalTable = (tableProps) => {
    const { tableBoarder } = tableProps;

    //draw outline
    if(tableBoarder) drawTableBoarder(tableProps);

    //Header
    drawVerticalHeader(tableProps);

    //Rows
    
};