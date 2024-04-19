/**
 * 
 * 
 */
import { rgb } from 'pdf-lib';
import { continuationSection } from './fillers';
import { drawRuler } from 'pdf-lib-utils';

import { checkUserInputs, processorData } from './functions/newLib'
import { calcColumnWidths, calcColumnHeaderWidths } from './functions/newLib/dataProcessing';



import { Doc, Table, Data, Header } from './classes';

//default colors
const black = rgb(0, 0, 0);
const white = rgb(1, 1, 1);
const blue = rgb(.21, .24, .85);
const grey = rgb(.03, .03, .03);

import {Document} from './classes/documents/document'
import { VerticalTable } from './classes/tables/vertical-table';

export async function drawTable({
    data, // Required - No Default - data t be printed
    page, // Required - No Default - page provided by pdf-lib
    pdfDoc, // Required - No Default - pdfDoc that the table will be printed on
    fonts,
    columns, // Required - No Default - column definitions
    pageDimensions=[792.0, 612.0],
    //TABLE SETTINGS
    startingX=0, // Default 0 - Default 0 - the starting x coordinate
    startingY=612, // Default 0 - the starting y coordinate
    appendedPageStartX=100,
    appendedPageStartY=512,
    appendedMaxTableWidth=500,
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
    //SUB HEADINGS
    subheadingColumns, // Required - No Default - column definitions
    subHeadingBackgroundColor=blue, //Currently not supported
    subHeadingHeight=12, //Currently not supported
    subHeadingFont, //Currently not supported
    subHeadingTextColor=black, //Currently not supported
    subHeadingTextSize=10, //Currently not supported
    subHeadingLineHeight=10,
    subHeadingDividedX,
    subHeadingDividedXThickness,
    subHeadingDividedXColor,
    subHeadingDividedY,
    subHeadingDividedYThickness,
    subHeadingDividedYColor,
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
    alternateRowColorValue=grey, //rgb(.03, .03, .03) - can pass in any pdf-lib rgb value
    
    //CELL SETTINGS
    cellFont, // Required -  No Default - any pdflib standard font
    cellTextSize=10, // Default 10 - cell text size
    cellHeight=11, //TODO: remove this
    cellLineHeight=10,
    cellTextColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    additionalWrapCharacters=['/']
    //cellPaddingBottom=0,
} = {}) {
    
    const doc = new Doc(
        page,
        pdfDoc,
        startingX,
        startingY,
        pageDimensions,
    );
        
    let remaningData = data;//this needs to be the counter in the loop below
    let endingY;
    
    //Loop through each page
    for (let loop = 0; loop < remaningData.length; loop++) {
        //console.log('loop', loop)

        // console.log('subHeadingBackgroundColor',subHeadingBackgroundColor);
        
        const docData = new Data(
            remaningData, 
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
            loop === 0 ? maxTableWidth : appendedMaxTableWidth,
            additionalWrapCharacters, 
            pageDimensions[0],
            pageDimensions,
            continuationFillerHeight,
            subheadingColumns,
            subHeadingFont,
            subHeadingTextSize,
            subHeadingLineHeight,
        );
        
        const columnWidths = docData.tableColumnWidths(loop === 0 ? startingX : appendedPageStartX, loop === 0 ? startingY : appendedPageStartY);
        const dataProcessor = docData.dataProcessor(columnWidths, loop);
        const headerData = docData.tableHeaders(columnWidths);
        const autoHeaderHeight = docData.tableHeader(columnWidths);
        
        const docObj = loop === 0 ? doc.documentPages[0] : doc.addPage();
        const tableData = dataProcessor.data.filter(row => row.values[0] && row.values[0].page === 0);//TODO: refactor because this is slicing data it is always looking for the current page data
        const tableHeight = tableData.reduce((accumulator, currentValue) => accumulator + currentValue.values[0].rowHeight,0,);
        
        // drawRuler(docObj.page, 'x', 25, rgb(.21, .24, .85));
        // drawRuler(docObj.page, 'y', 25, rgb(.21, .24, .85));

        // console.log('tableData', tableData)
        
        const table = new Table(
            docObj,
            tableData,
            columns,
            columnWidths,
            loop === 0 ? startingX : appendedPageStartX,
            loop === 0 ? startingY : appendedPageStartY,
            tableType,
            dividedX,
            dividedY,
            dividedXColor,
            dividedYColor,
            dividedXThickness,
            dividedYThickness,
            loop === 0 ? maxTableWidth : appendedMaxTableWidth,
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
            alternateRowColorValue,
            //CELL
            cellFont,
            cellTextSize, // Default 10 - cell text size
            cellHeight=11, //TODO: remove this
            cellLineHeight,
            cellTextColor, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
            additionalWrapCharacters= ['/'],
            headerHeight,
            autoHeaderHeight,
            tableHeight,
            //Header
            headerFont,
            headerTextSize,
            //subheadingColumns,
            //SUB HEADINGS
            subheadingColumns,
            subHeadingBackgroundColor,
            subHeadingHeight,
            subHeadingFont,
            subHeadingTextColor,
            subHeadingTextSize,
            subHeadingLineHeight,
            subHeadingDividedX,
            subHeadingDividedXThickness,
            subHeadingDividedXColor,
            subHeadingDividedY,
            subHeadingDividedYThickness,
            subHeadingDividedYColor,
        );
    
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

        
        //Draw Table
        // if(table.dividedY) table.drawDividerY();
        if(table.tableBoarder) table.drawBoarder();
        //console.log('boarder done')

        //Headers 
        header.drawHeader(table.tableWidth);
        //console.log('header done')

        //Rows
        const rows = table.rows;
        
        rows.forEach((row, index) => {
            //Row
            // const t6 = performance.now();
            row.drawRowBackground(index);
            //console.log('Background done')
            // if(row.type === 'row') row.drawRowBackground(index);
            // if(row.type === 'subheading' && ) row.drawRowBackground(index);

            if(index !== table.rows.length - 1 && table.dividedX)row.drawDividerX();
            //console.log('divider x done')

            
            //Cells
            row.cells.forEach((cell) => {
                cell.drawCell(docObj, table.dividedY);
            });

            //console.log('all cells done')
        });
        //console.log('rows done')
        
        
        remaningData = remaningData.slice(table.rows.length);
        
        if(remaningData.length > 0) continuationFiller(table.docPage, continuesOnNextPage, continuationTextX, continuationTextY, headerFont, continuationFontSize, continuationFillerHeight, continuationText);
        if(remaningData.length === 0) endingY = table.remainingTableSpace;
    };


    return {endingY, pages: doc.documentPages};
};


export async function drawTable2(
    data, // Required - No Default - data t be printed
    page, // Required - No Default - page provided by pdf-lib
    pdfDoc, // Required - No Default - pdfDoc that the table will be printed on
    columns, // Required - No Default - column definitions
    fonts,
    colors,
    options = {
        pageDimensions,
        //TABLE SETTINGS
        startingX,
        startingY,
        appendedPageStartX,
        appendedPageStartY,
        appendedMaxTableWidth,
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
        //CONTINUES
        continuesOnNextPage,
        continuationFiller,
        continuationTextX ,
        continuationTextY,
        continuationFont,
        continuationFontSize,
        continuationFillerHeight,
        continuationText,
        //SUB HEADINGS
        subheadingColumns, // Required - No Default - column definitions
        subHeadingBackgroundColor,
        subHeadingHeight,
        subHeadingFont, //Currently not supported
        subHeadingTextColor,
        subHeadingTextSize,
        subHeadingLineHeight,
        subHeadingDividedX,
        subHeadingDividedXThickness,
        subHeadingDividedXColor,
        subHeadingDividedY,
        subHeadingDividedYThickness,
        subHeadingDividedYColor,
        subheadingWrapText,
        //HEADER SETTINGS
        headerFont, // Required -  No Default - any pdflib standard font
        headerDividedX,
        headerDividedY,
        headerDividedXColor,
        headerDividedYColor,
        headerDividedXThickness,
        headerDividedYThickness,
        headerBackgroundColor,
        headerHeight,
        headerTextColor,
        headerTextSize,
        headerLineHeight,
        headerTextAlignment,
        headerTextJustification,
        headerWrapText,
        //ROWSETTINGS
        rowBackgroundColor,
        alternateRowColor,
        alternateRowColorValue,
        
        //CELL SETTINGS
        cellFont, // Required -  No Default - any pdflib standard font
        cellTextSize,
        cellHeight,
        cellLineHeight,
        cellTextColor,
        additionalWrapCharacters,
        //cellPaddingBottom=0,
    } = {}) {

    //Through errors if inputs are bad
    const error = checkUserInputs(arguments);
    if(error) return error;

    // build the document
    const document = new Document(page, pdfDoc, fonts, colors);

    //Add pages and print tables
    let remainingData = data;

    // for (let loop = 0; remainingData.length > 0; loop++) {
    for (let loop = 0; loop < 1; loop++) {
        // console.log(remainingData)
        
        if(loop !== 0) document.addPage([792.0, 612.0]); 
        
        const columnHeaderWidths = calcColumnHeaderWidths(columns, options);        //sets the initial width of the columns based on the size of the header
        const t0 = performance.now();
        const [columnDimensions, verticalDimensions, tableData, additionalData] = calcColumnWidths(data, columnHeaderWidths, options, document.pages[0]);
        const t1 = performance.now();
        
        const table = new VerticalTable(remainingData, columns);
        document.addTable(table);
        
        remainingData = additionalData;
        console.log(`It took ${t1 - t0} milliseconds to generate page.`);
    }

    //process data

    // console.log(columnDimensions);
    // console.log(verticalDimensions);
    // console.log(tableData);
    // console.log(remainingData);

    //add pages
    //add tables




    return document;
};