/**
 * 
 * 
 */
import { rgb } from 'pdf-lib';
import { drawRuler } from 'pdf-lib-utils';
import { getLongestColumnItem, getColumnManualWidths, getHeaderItemLengths, getColumnWidths, getColumnIds, getNumberOfRows, getNumberOfSubHeadings, getTotalPages, createPages, getRowsByPage, getWrapedText, getRowMeasurments, tableColumnWidths, tableCells, tableRows} from './functions/lib';

import { draw2WayTable, drawHorizontalTable, drawVerticalTable } from './functions/table';
import { getHeaderRows } from './functions/header/headerFuncitons';
import { getTotalRowHeight } from './functions/row/rowFunctions';
import { continuationSection } from './fillers';



import { Document, Page, Table, Data, Header, Row} from './classes';

//default colors
const black = rgb(0, 0, 0);
const white = rgb(1, 1, 1);
const blue = rgb(.21, .24, .85);
const grey = rgb(.03, .03, .03);

export async function drawTable({
    data, // Required - No Default - data t be printed
    page, // Required - No Default - page provided by pdf-lib
    pdfDoc, // Required - No Default - pdfDoc that the table will be printed on
    fonts,
    columns, // Required - No Default - column definitions
    pageDimensions=[792.0, 612.0],
    appendedPageStartX=0,
    appendedPageStartY=612,
    //TABLE SETTINGS
    startingX=0, // Default 0 - Default 0 - the starting x coordinate
    startingY=612, // Default 0 - the starting y coordinate
    tableType='vertical', // Default 'vertical' - Options: vertical || horizontal || 2way TODO: horizontal || 2way not suported yet
    dividedX=true, // Default true - sets if the table has x dividers
    dividedY=true, // Default true - sets if the table has y dividers
    dividedXColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    dividedYColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    dividedXThickness=1, // Default 1 - sets x divider thickness
    dividedYThickness=1, // Default 1 - sets y divider thickness
    maxTableWidth=false, // Default false - table is defaulted to page width but a max value can be passed
    maxTableHeight=false, // Default false - table is defaulted to page height but a max value can be passed
    rowHeightSizing='auto', // Default 'auto' //TODO: remove this.
    tableBoarder=true, // Default true - tables have a boader by default but it can be removed by passing false
    tableBoarderThickness=1, // Default 1 - sets the thickness of the table boarder
    tableBoarderColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    rounded=false, //TODO: add or remove this option. Currently not supported
    //CONTINUES
    continuesOnNextPage=false, // Default false - can pass a function for what to draw //TODO: add this.
    continuationFiller=(page, continuesOnNextPage, continuationX, continuationY, continuationFont, continuationFontSize, continuationFillerHeight, continuationText) => continuationSection(page, continuesOnNextPage, continuationX, continuationY, continuationFont, continuationFontSize, continuationFillerHeight, continuationText),
    continuationTextX = undefined, // Text starting X
    continuationTextY=10, //Text starting Y
    continuationFont=undefined, // Text font
    continuationFontSize=15, // text font size
    continuationFillerHeight=20, // this is the hight that will be left by the table
    continuationText='Continues on Next Page',
    //SUB HEADINGS TODO: not suported yet
    subHeadingBackgroundColor='#8a8584', //TODO: Currently not supported
    subHeadingHeight=12, //TODO: Currently not supported
    subHeadingFont='timesnewroman', //TODO: Currently not supported
    subHeadingTextColor=black, //TODO: Currently not supported
    subHeadingTextSize='10', //TODO: Currently not supported
    //HEADER SETTINGS
    headerFont, // Required -  No Default - any pdflib standard font
    headerDividedX=true, // Default true - sets if the table header has x dividers
    headerDividedY=true, // Default true - sets if the table header has y divider
    headerDividedXColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerDividedYColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerDividedXThickness=1, // Default 1 - sets the thickness of the table header x divider
    headerDividedYThickness=1, // Default 1 - sets the thickness of the table header y divider
    headerBackgroundColor=grey, // Default - rgb(.03, .03, .03) - can pass in any pdf-lib rgb value
    headerHeight=undefined, // Default 10 - height of the table header
    headerTextColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerTextSize=10, // Default 10 - table header text size
    headerLineHeight=10,
    headerTextAlignment='left', // Default 'left' - left/right/center 
    headerTextJustification='top', //Default 'top' - top/center/bottom
    headerWrapText=false, // Default false - allows text in the header to wrap
    //ROWSETTINGS
    rowBackgroundColor=white, //rgb(1, 1, 1) - can pass in any pdf-lib rgb value
    alternateRowColor=true, // Default true - cell rows will alternate background color
    alternateCellColorValue=grey, //rgb(.03, .03, .03) - can pass in any pdf-lib rgb value
    
    //CELL SETTINGS
    cellFont, // Required -  No Default - any pdflib standard font
    cellTextSize=8, // Default 10 - cell text size
    cellHeight=11, //TODO: remove this
    cellLineHeight=10,
    cellTextColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    additionalWrapCharacters= ['/']
    //cellPaddingBottom=0,
} = {}) {

    //columns widths
    // const columnWidths = tableColumnWidths(data, columns, startingX, startingY, maxTableWidth, page.getWidth(), cellFont, cellTextSize, additionalWrapCharacters); // {colID: width} thats it all logic needs to live here.
    // const rows = tableRows(data, columns, columnWidths, startingX, startingY, maxTableWidth, page.getWidth(), cellFont, cellTextSize, cellLineHeight, additionalWrapCharacters, headerHeight);//wrap the text and define where the text will print on the page; row -> [{colID, startingX, startingY, font, rowHeight, textHeight, values: [line1 of text, line 2 of text]}]
    // const cells = tableCells(data, columns, columnWidths, startingX, startingY, maxTableWidth, page.getWidth(), cellFont, cellTextSize, cellLineHeight, additionalWrapCharacters);//wrap the text and define where the text will print on the page; row -> [{colID, startingX, startingY, font, rowHeight, textHeight, values: [line1 of text, line 2 of text]}]
    // //number & height of rows and which page the row will print on; from above [[rows], [rows]]



    // headerHeight headerFont, headerTextSize, headerWrapText
    
    const doc = new Document(
        page,
        pdfDoc,
        startingX,
        startingY,
        pageDimensions,
    );

    const docData = new Data(
        data, 
        columns,
        startingX,
        startingY,
        appendedPageStartX,
        appendedPageStartY,
        headerHeight, 
        headerFont, 
        headerTextSize, 
        headerLineHeight,
        headerWrapText,
        cellFont, 
        cellTextSize, 
        cellLineHeight, 
        maxTableWidth,
        additionalWrapCharacters, 
        792.0,
        pageDimensions
    );

    //Data
    const testFont = await doc.addFont();
    const columnWidths = docData.tableColumnWidths();
    const dataProcessor = docData.dataProcessor(columnWidths, testFont);
    const totalPages = dataProcessor.pages;
    const headerData = docData.tableHeaders(columnWidths);
    const autoHeaderHeight = docData.tableHeader(columnWidths);

    //Loop through each page
    for (let loop = 0; loop <= totalPages; loop++){
        const docObj = loop === 0 ? doc.documentPages[0] : doc.addPage();
        const tableData = dataProcessor.data.filter(row => row[0].page === loop);
        const tableHeight = tableData.reduce((accumulator, currentValue) => accumulator + currentValue[0].rowHeight,0,);

        drawRuler(docObj.page, 'x', 25, rgb(.21, .24, .85));
        drawRuler(docObj.page, 'y', 25, rgb(.21, .24, .85));

        const table = new Table(
            docObj,
            tableData,
            columns,
            columnWidths,
            startingX,
            startingY,
            tableType,
            dividedX,
            dividedY,
            dividedXColor,
            dividedYColor,
            dividedXThickness,
            dividedYThickness,
            maxTableWidth,
            maxTableHeight,
            rowHeightSizing,
            tableBoarder,
            tableBoarderThickness,
            tableBoarderColor,
            rounded,
            //customContinuesOnNextPage,
            //continuationFiller=(page, x, y, font) => continuationSection(page, x, y, font),
            continuationFillerHeight,
            //ROW
            rowBackgroundColor,
            alternateRowColor,
            alternateCellColorValue,
            //CELL
            cellTextSize=8, // Default 10 - cell text size
            cellHeight=11, //TODO: remove this
            cellLineHeight=10,
            cellTextColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
            additionalWrapCharacters= ['/'],
            headerHeight,
            autoHeaderHeight,
            tableHeight,
        );

        if(table.dividedY) table.drawDividerY();
        if(table.tableBoarder) table.drawBoarder();

        

        const header = new Header(
            table.docPage,
            columns, 
            headerData,
            table.columnIds,
            table.headers,
            columnWidths, 
            table.startingX, 
            table.startingY,
            headerHeight,
            autoHeaderHeight,
            headerBackgroundColor,
            headerWrapText,
            headerFont,
            headerTextSize,
            headerLineHeight,
            headerTextColor,
            headerTextAlignment,
            headerTextJustification,
            headerDividedX,
            headerDividedY,
            headerDividedXColor,
            headerDividedYColor,
            headerDividedXThickness,
            headerDividedYThickness,
            
        );

        //Headers 
        header.drawHeader(table.tableWidth);
        
        //Rows
        table.rows.forEach((row, index) => {
            //Row
            row.drawRowBackground(index);
            if(index !== table.rows.length - 1)row.drawDividerX();
            //Cells
            row.cells.forEach((cell) => {
                cell.drawCell(docObj);
            })
        })

        if(loop < totalPages) continuationFiller(table.docPage, continuesOnNextPage, continuationTextX, continuationTextY, headerFont, continuationFontSize, continuationFillerHeight, continuationText)
    };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // // process data
    // const pageHeight = page.getHeight();
    // const pageWidth = page.getWidth();

    // const numberOfRows = getNumberOfRows(data);

    // const numberOfSubHeadings = getNumberOfSubHeadings(data);
    // const columnIds = getColumnIds(columns); 
    // const headerLengths = getHeaderItemLengths(columns, headerFont, headerTextSize);
    // const longestRowItem = getLongestColumnItem(data, cellFont, cellTextSize);
    // const manualColumnWidths = getColumnManualWidths(columns);
    // const availableTableWidth = !maxTableWidth ? (pageWidth - startingX) : Math.min(pageWidth, maxTableWidth);
    
    // const columnWidths = getColumnWidths({
    //     page,
    //     columnIds,
    //     startingX,
    //     pageHeight,
    //     pageWidth,
    //     maxTableWidth,
    //     maxTableHeight,
    //     manualColumnWidths,
    //     headerLengths,
    //     longestRowItem,
    //     availableTableWidth
    // });
    
    // //Heeder Measurments
    // const headerTextRows = getHeaderRows({ headerWrapText, columns, headerFont, headerTextSize, columnWidths });
    // const headerFullTextHeight = headerTextRows * headerTextSize;
    // const totalHeaderHeight = Math.max(headerHeight, headerFullTextHeight);
    // const rowSectionStartingY =  totalHeaderHeight + cellTextSize;
    // const TotalRowHeight = getTotalRowHeight(data, cellFont, cellTextSize, cellTextSize, 0, columnWidths);
    
    
    
    // const availableTableHeight = totalHeaderHeight + TotalRowHeight //+ (numberOfSubHeadings * subHeadingHeight);
    // const totalPages = getTotalPages(page, pageHeight, availableTableHeight, startingY);
    // const allPages = createPages(page, totalPages, pageDimensions, pdfDoc, totalPages);
    // const rowsByPage = getRowsByPage(allPages, numberOfRows);


    // ///ROWS
    // const rowMeasurments = getRowMeasurments(data, startingY, cellFont, cellTextSize, columnWidths, rowSectionStartingY);

    
    
    // // build table
    // const tableProps = {
    //     data,
    //     page,
    //     pdfDoc,
    //     columns,
    //     columnIds,
    //     pageDimensions,
    //     appendedPageStartX,
    //     appendedPageStartY,
    //     //TABLE SETTINGS
    //     startingX,
    //     startingY,
    //     tableType,
    //     dividedX,
    //     dividedY,
    //     dividedXColor,
    //     dividedYColor,
    //     dividedXThickness,
    //     dividedYThickness,
    //     maxTableWidth,
    //     maxTableHeight,
    //     rowHeightSizing,
    //     alternateRowColor,
    //     alternateCellColor,
    //     tableBoarder,
    //     tableBoarderThickness,
    //     tableBoarderColor,
    //     rounded,
    //     customContinuesOnNextPage,
    //     //FILLERS
    //     continuationFiller,
    //     continuationFillerHeight,
    //     //SUB HEADINGS
    //     subHeadingBackgroundColor,
    //     subHeadingHeight,
    //     subHeadingFont,
    //     subHeadingTextColor,
    //     subHeadingTextSize,
    //     //HEADER SETTINGS
    //     headerFont,
    //     headerDividedX,
    //     headerDividedY,
    //     headerDividedXColor,
    //     headerDividedYColor,
    //     headerDividedXThickness,
    //     headerDividedYThickness,
    //     headerBackgroundColor,
    //     headerHeight,
    //     headerTextColor,
    //     headerTextSize,
    //     headerTextAlignment,
    //     headerWrapText,
    //     //CELL SETTINGS
    //     cellFont,
    //     cellBackgroundColor,
    //     cellTextSize,
    //     cellTextColor,
    //     cellHeight,
    //    // cellPaddingBottom,
    //     //DERIVED
    //     totalPages,
    //     allPages,
    //     pageHeight,
    //     pageWidth,
    //     numberOfRows,
    //     numberOfSubHeadings,
    //     availableTableWidth,
    //     availableTableHeight,
    //     headerLengths,
    //     longestRowItem,
    //     manualColumnWidths,
    //     columnWidths,
    //     headerTextRows,
    //     headerFullTextHeight,
    //     rowSectionStartingY,
    //     rowMeasurments
    // };

    // if(tableType === 'vertical') drawVerticalTable(tableProps);
    // // if(tableType === 'horizontal') drawHorizontalTable(tableProps);
    // // if(tableType === '2way') draw2WayTable(tableProps);

    // return allPages; //TODO: i need to return the end of the table and an array of pages that the table was printed on.
};


