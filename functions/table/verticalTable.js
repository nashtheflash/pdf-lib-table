import { drawTableBoarder } from "./elements";
import { drawVerticalHeader } from "../header";
import { drawRows } from "../row";

export const drawVerticalTable = (tableProps) => {
    const { tableBoarder } = tableProps;

    //draw outline
    if(tableBoarder) drawTableBoarder(tableProps);
    console.log('drawTableBoarder Done')
    
    //Header
    drawVerticalHeader(tableProps);
    console.log('drawVerticalHeader Done')
    
    //Rows
    drawRows(tableProps);
    console.log('drawRows Done')
};