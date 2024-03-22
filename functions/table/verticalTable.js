import { drawTableBoarder } from "./elements";
import { drawHorizontalHeader } from "../header";
import { drawRows } from "../row";

export const drawVerticalTable = (tableProps) => {
    const { data, tableBoarder, continuationFiller, page, totalPages, cellFont, allPages, pageHeight, availableTableHeight, startingY, continuationFillerHeight, rowMeasurments} = tableProps;
    //let { rowStartingY, rowRows, rowHeight } = rowMeasurments[index];

    //TODO: need to get the rows to print on each page

    
    const overflow = availableTableHeight - (startingY - continuationFillerHeight);
    const pageOneTableHeight = overflow < 0 ? availableTableHeight : availableTableHeight - overflow;

    const pageRows = seperateData(rowMeasurments, overflow, pageOneTableHeight, totalPages, data, continuationFillerHeight, allPages);
    
    
    //[[],[],[],[]]
    allPages.forEach ((page, i) =>{
        const pageTableHeight = 0;
        
        //draw outline
        if(tableBoarder) drawTableBoarder(tableProps);
        //Header
        drawHorizontalHeader(tableProps);
        //Rows
        drawRows(tableProps);
        //CONTINUATION
        i != allPages.length - 1 && continuationFiller(page, continuationFillerHeight, cellFont);
        //continuationFiller(page, continuationFillerHeight, cellFont)
    })
    
};


const seperateData = (rowMeasurments, overflow, pageOneTableHeight, totalPages, data, continuationFillerHeight, allPages) => {
    let pageTableHeight = 0;
    let pageNum = 0;

    let dataarr = [];

    for (let loop = 0; loop < totalPages; loop++) {
        dataarr.push([]);
    };

    for (let loop = 0; loop < rowMeasurments.length; loop++) {
        const rowHeight = rowMeasurments[loop].rowHeight;
        

        if((pageTableHeight + rowHeight < pageOneTableHeight) || (pageNum > 0 && pageTableHeight + rowHeight < allPages[pageNum].getHeight())) {
            dataarr[pageNum].push(data[loop]);
            pageTableHeight += rowHeight;
        } else {
            pageNum++;
            dataarr[pageNum].push(data[loop])
            pageTableHeight = 0;
        }

    };
    pageNum = 0;
    return dataarr;

}