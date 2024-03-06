/**
 * 
 * 
 */
import { rgb } from 'pdf-lib';
import { getLongestColumnItem, getColumnManualWidths, getHeaderItemLengths, getColumnWidths, getColumnIds, getNumberOfRows, getNumberOfSubHeadings } from './functions/lib';
import { draw2WayTable, drawHorizontalTable, drawVerticalTable } from './functions/table';
import { getHeaderRows } from './functions/header/headerFuncitons';
import { getTotalRowHeight } from './functions/row/rowFunctions';

//default colors
const black = rgb(0, 0, 0);
const white = rgb(1, 1, 1);
const blue = rgb(.21, .24, .85);
const grey = rgb(.03, .03, .03);

export async function drawTable({
    data, // Required - No Default - data t be printed
    page, // Required - No Default - page provided by pdf-lib
    pdfDoc, // Required - No Default - pdfDoc that the table will be printed on
    columns, // Required - No Default - column definitions
    //TABLE SETTINGS
    startingX=0, // Default 0 - Default 0 - the starting x coordinate
    startingY=0, // Default 0 - the starting y coordinate
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
    customContinuesOnNextPage=false, // Default false - can pass a function for what to draw
    smPageFiller=false, // Default false - can pass a function for what to draw TODO: Currently not supported
    mdPageFiller=false, // Default false - can pass a function for what to draw TODO: Currently not supported
    lgPageFiller=false, // Default false - can pass a function for what to draw TODO: Currently not supported
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
    headerHeight=10, // Default 10 - height of the table header
    headerTextColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerTextSize=10, // Default 10 - table header text size
    headerTextAlignment='left', // Default 'left' - left/right/center 
    headerWrapText=false, // Default false - allows text in the header to wrap
    //CELL SETTINGS
    cellFont, // Required -  No Default - any pdflib standard font
    cellBackgroundColor=white, //rgb(1, 1, 1) - can pass in any pdf-lib rgb value
    alternateRowColor=true, // Default true - cell rows will alternate background color
    alternateCellColor=grey, //rgb(.03, .03, .03) - can pass in any pdf-lib rgb value
    cellTextSize=10, // Default 10 - cell text size
    cellHeight=10,
    cellTextColor=black, // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    cellPaddingBottom=0,
} = {}) {
    // process data
    const pageHeight = page.getHeight();
    const pageWidth = page.getWidth();
    const numberOfRows = getNumberOfRows(data);
    const numberOfSubHeadings = getNumberOfSubHeadings(data);
    const columnIds = getColumnIds(columns); 
    const headerLengths = getHeaderItemLengths(columns, headerFont, headerTextSize);
    const longestRowItem = getLongestColumnItem(data, cellFont, cellTextSize);
    const manualColumnWidths = getColumnManualWidths(columns);
    //const autoColumnWidths = getColumnAutoWidths(columns);
    const availableTableWidth = !maxTableWidth ? (pageWidth - startingX) : Math.min(pageWidth, maxTableWidth);
    const columnWidths = getColumnWidths({
        page,
        columnIds,
        startingX,
        pageHeight,
        pageWidth,
        maxTableWidth,
        maxTableHeight,
        manualColumnWidths,
        headerLengths,
        longestRowItem,
        availableTableWidth
    });
    
    //Heeder Measurments
    const headerTextRows = getHeaderRows({ headerWrapText, columns, headerFont, headerTextSize, columnWidths });
    const headerFullTextHeight = headerTextRows * headerTextSize;
    const totalHeaderHeight = Math.max(headerHeight, headerFullTextHeight);
    const rowSectionStartingY =  totalHeaderHeight + cellHeight;
    const TotalRowHeight = getTotalRowHeight(data, cellFont, cellTextSize, cellHeight, cellPaddingBottom, columnWidths);
    const availableTableHeight = totalHeaderHeight + TotalRowHeight + (numberOfSubHeadings * subHeadingHeight);
    
    // build table
    const tableProps = {
        data,
        page,
        pdfDoc,
        columns,
        columnIds,
        //TABLE SETTINGS
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
        alternateRowColor,
        alternateCellColor,
        tableBoarder,
        tableBoarderThickness,
        tableBoarderColor,
        rounded,
        customContinuesOnNextPage,
        smPageFiller,
        mdPageFiller,
        lgPageFiller,
        //SUB HEADINGS
        subHeadingBackgroundColor,
        subHeadingHeight,
        subHeadingFont,
        subHeadingTextColor,
        subHeadingTextSize,
        //HEADER SETTINGS
        headerFont,
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
        headerTextAlignment,
        headerWrapText,
        //CELL SETTINGS
        cellFont,
        cellBackgroundColor,
        cellTextSize,
        cellTextColor,
        cellHeight,
        cellPaddingBottom,
        //DERIVED
        pageHeight,
        pageWidth,
        numberOfRows,
        numberOfSubHeadings,
        availableTableWidth,
        availableTableHeight,
        headerLengths,
        longestRowItem,
        manualColumnWidths,
        columnWidths,
        headerTextRows,
        headerFullTextHeight,
        rowSectionStartingY
    };

    if(tableType === 'vertical') drawVerticalTable(tableProps);
    // if(tableType === 'horizontal') drawHorizontalTable(tableProps);
    // if(tableType === '2way') draw2WayTable(tableProps);

    return tableType;
};